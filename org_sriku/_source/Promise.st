Smalltalk current createPackage: 'Promise'!
Object subclass: #Promise
	instanceVariableNames: 'state value chain callback errback'
	package: 'Promise'!
!Promise commentStamp!
I promise to provide a value which is not available immediately. Using me, you can setup receivers for my value when it becomes available, or handlers for errors when they happen. You'll find me useful to work with asynchronous APIs.

The implementation and behaviour corresponds mostly to the [Promises/A+ specification], with adaptations for smalltalk. It also has some extra goodies like automatic method forwarding.

[Promises/A+ specification]: http://promises-aplus.github.io/promises-spec/

## Creating promises

This is just `Promise new` usually.

On occasion, it is useful to club a number of statements to build a promise. To do this use `Promise with: [:p| ...]`.

## Fulfilling and rejecting promises

Use `#fulfill:` and `#reject:` to do this. Usually, the fulfillment and rejection can be expected to be handled by some asynchronous API call. Many asynchronous JS API functions take `callback`/`errback` arguments. To support these you can get one-argument functions that either fulfill or reject a promise by sending `#callback` and `#errback` messages respectively. These blocks are cached once created, so there is no extra cost the second and subsequent times.

## Triggering activities once a promise has been fulfilled or rejected

Use a cascade of `#then:else:` messages to setup a number of activities all of which should be started or aborted depending on what happens to the activity represented by this promise.

## Preparing a sequence of asynchronous actions

Create an `PromiseChain` by sending `#begin` to a `Promise` and use a cascade of `#then:else:` messages on the sequence object. Each activity corresponding to a `#then:else:` will pass its result to the one following it.

## Multiple "threads" of asynchronous activities

Sending the `#begin` message to an `PromiseChain` makes a new instance starting from the base promise on which the receiver was created. So using this, you can easily code up multiple "threads" of activities. For example, if you have a promise `pr` that you want to be followed
by two action sequences a1,a2,a3 and b1,b2,b3, you can do it like this -

	pr 
		begin 
			then: a1;
			then: a2;
			then: a3;
		begin
			then: b1;
			then: b2;
			then: b3.
		
## asPromise

You can send `#asPromise` to any object to wrap it in a `Promise` instance that will deliver its value to some client code.

1. Sending `#asPromise` to a `Promise` instance will simply return `self`.

2. Sending `#asPromise` to most objects will just result in a `Promise` instance that will deliver the object itself as is.

3. IndexableCollection targets - When an `IndexableCollection` receives `#asPromise` it first examines whether the collection contains any `Promise` instances. If it does, then it returns a `Promise` instance that will deliver a collection which contains only resolved values. The receiving collection is modified in-place with the resolved values of the promises.

4. BlockClosure targets - If you have a block with two arguments `callback` and `errback`, each of which is a one argument block, you can use `callback` and `errback` within some internal blocks to notify the completion or failure of the block. Given such a block, you can convert it into a promise using `#asPromise`.

	    [:callback :errback | Transcript show: 'yes'. callback value: 42] asPromise
	    	then: [:y| Transcript show: 'following up with ', y]
		
5. Sending `#asPromise` to a `PromiseChain` will result in the final promise in the sequence.

## A promise stands for the promised value (... mostly ;)

You can send a `Promise` instance messages that are intended for the value that it promises to produce. The result will be a promise that will be fulfilled once the receiving promise realizes the value, sends the message to it and fulfills the result promise with the return value of the method that handed the message.

Code speaks clearer -

    |p q|
    p := Promise new.
    q := (p tokenize: '/') inspect.
    [p fulfill: 'path/to/somewhere'] valueWithTimeout: 2000.
    "The inspector will open with an array after about 2 seconds."

Now, since `Promise` is a subclass of `Object`, there are already many methods provided for, which we might intend for the promised value instead of the promise itself. If you want to send a message to the promised value that `Object` itself understands, this auto-wrapping mechanism will not be triggered since `#doesNotUnderstand:` will not happen to the promise object. For these cases, use `#forward:` or `#forward:arguments:`, which will return a promise for the result of sending the selector with the given arguments to the value when it becomes available.

Rant: What I'd really like here is some way to trap messages and decide which ones to make promises out of and which ones to let the default `Object` behaviour take over.!

!Promise methodsFor: 'initialization'!

initialize
	state := 0.
	chain := {}.
! !

!Promise methodsFor: 'inspecting'!

inspect
	"Inspect the value. The promise itself is usually not of interest."
	^self then: [:v| v inspect]
!

inspectOn: anInspector
	"Inspect the value. The promise itself is not usually of interest."
	^self then: [:v| v inspectOn: anInspector]
! !

!Promise methodsFor: 'message handling'!

doesNotUnderstand: aMessage
	"Forward the message to the value, when it and all the
	arguments of the message become available.
	
	This is likely very expressive for async programming, since
	pretty much all of the language and environment now becomes
	available asynchronously via promises. You can, for example,
	take two promised numbers and add them to get a promise of
	the result."
	^self forwardMessage: aMessage
!

forward: aMessageOrSelector

	^(aMessageOrSelector isKindOf: Message)
		ifTrue: [self forwardMessage: aMessageOrSelector]
		ifFalse: [Promise with: [:p|
					self begin
						then: [:v| v perform: aMessageOrSelector];
						then: (p callback) else: (p errback)]]
!

forward: aSelector arguments: someArguments
	^self forwardMessage: (Message selector: aSelector arguments: someArguments)
!

forwardMessage: aMessage

	"See IndexableCollection>>asPromise.
	When, say, an Array is sent #asPromise, you get a promise object
	that will, when fulfilled, yield the same array with all entries
	that are themselves promises resolved to their values in-place."
	
	^Promise with: [:p|
					aMessage arguments asPromise begin
						then: [self];
						then: [:v| aMessage sendTo: v];
						then: (p callback) else: (p errback)]
! !

!Promise methodsFor: 'overrides'!

asJSON
	^self then: [:v| v asJSON]
!

asJSONString
	^self then: [:v| v asJSONString]
!

printOn: aStream
	|p|
	^(aStream isKindOf: Promise)
		ifTrue: [
			p := Promise new.
			aStream begin
				then: [self];
				then: [:v| p fulfill: (v printOn: aStream value)] else: p errback.
			p]
		ifFalse: [self then: [:v| v printOn: aStream]].
!

printString
	^self then: [:v| v printString]
!

putOn: aStream
	^Promise with: [:p| |stream|
		stream := aStream asPromise.
		stream begin
			then: [self];
			then: [p fulfill: ((self value) putOn: (stream value))]
			else: p errback.].
!

size
	^self then: [:v| v size]
! !

!Promise methodsFor: 'private'!

adoptState: promise
	"Results in myself getting the current state of promise,
	and a setup such that both our states will remain in sync
	henceforth."
	[[self fulfill: promise value]
		on: PromiseFailed 
		do: [:e| self reject: e reason.]]
		on: PromiseValueNotAvailableYet 
		do: [:e| 
			state := 0. 
			value := nil. 
			promise then: self callback else: self errback.].
	^nil.
!

commit
	""
	((chain size > 0) & (state > 0)) ifTrue: [[self commitNow] fork].
!

commitNow
	""
	chain do: [ :step | 
		|action promise2|
		action := step at: state.
		promise2 := step at: 3.
		action 
			ifNil: [
				state = 1 ifTrue: [promise2 fulfill: value]
						  ifFalse: [promise2 reject: value]]
			ifNotNil: [
				[[Promise resolve: promise2 value: (action value: value)]
					on: Error do: promise2 errback] fork]].
	chain removeFrom: 1 to: chain size.
!

description
	""
	^'(Promise state=', state, ' value=', value, ' chain size=', chain size, ')'.
! !

!Promise methodsFor: 'promise'!

asPromise
	^self
!

begin
	"Restarts the sequence of asynchronous actions from the base promise."
	^PromiseChain startingWith: self.
!

callback
	"You can fulfill a promise by calling its success callback
	function, which is obtained by sending #callback to the
	promise. I cache the callback/errback once created."	
	^callback ifNil: [callback := [:val| self fulfill: val]]
!

errback
	"You can reject a promise by calling its errback function
	obtained by sending the promise #errback. I cache the errback
	once created."
	^errback ifNil: [errback := [:e| self reject: e]].
!

fulfill: aValue
	""
	state = 0 ifTrue: [
		"Change to RESOLVED state"
		state := 1. 
		value := aValue].
	self commit.
	
	"Important to return value so that further message sends can
	directly address the value instead of the promise. If the
	promise is already resolved or rejected, then this value will
	either be the old value or the error reason."
	^value.
!

reject: aValue
	""
	state = 0 ifTrue: [
		"Change to REJECTED state."
		state := 2.
		value := aValue].
	self commit.
	
	"Important to return value, since it could be
	an Error object, in which case it is useful to
	be able to send signal to that object after
	using it as the reason to reject a promise.
	If the promise is already resolved, then this
	value will be the resolved value instead of the
	error."
	^value.
!

then: onFulfilled
	^ self then: onFulfilled else: nil.
!

then: onFulfilled else: onRejected
	"Adds one more client for the current promise.
	A cascade of #then:else: messages can be used to trigger a number
	of activities all of which require the results of this promise.
	To construct a sequence of activities each of which is dependent
	on the result of the preceding one in the sequence, use a cascade
	of #then:else: messages on a `PromiseSequence` instance which can
	be created by sending `#begin`."
	
	|p|
	
	p := Promise new.
	chain add: {onFulfilled. onRejected. p}.
	self commit.
	^p.
!

value
	""
	state = 1 ifTrue: [^value].
	state = 0 ifTrue: [^PromiseValueNotAvailableYet signal].
	(PromiseFailed reason: value) signal.
! !

!Promise class methodsFor: 'promise'!

resolve: promise value: x
	"
	From: http://promises-aplus.github.io/promises-spec/#notes
	
	If promise and x refer to the same object, reject promise with a TypeError as the reason.
	If x is a promise, adopt its state 3.4:
		If x is pending, promise must remain pending until x is fulfilled or rejected.
		If/when x is fulfilled, fulfill promise with the same value.
		If/when x is rejected, reject promise with the same reason.
	Otherwise, if x is an object or function,
		Let then be x.then. 3.5
		If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.
		If then is a function, call it with x as this, first argument resolvePromise, and second argument rejectPromise, where:
			If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
			If/when rejectPromise is called with a reason r, reject promise with r.
			If both resolvePromise and rejectPromise are called, or multiple calls to the same argument are made, the first call takes precedence, and any further calls are ignored.
			If calling then throws an exception e,
				If resolvePromise or rejectPromise have been called, ignore it.
				Otherwise, reject promise with e as the reason.
		If then is not a function, fulfill promise with x.
	If x is not an object or function, fulfill promise with x.	
	"

	promise == x ifTrue: [^PromiseTypeError signal].
	(x isKindOf: Promise) ifTrue: [^promise adoptState: x end].
	[( x respondsTo: #then:else: )
		ifTrue: [x 	then: [:y| Promise resolve: promise value: y]
				   	else: promise errback]
		ifFalse: [promise fulfill: x]]
		on: Error do: promise errback.
	^nil.
!

with: aBlock
	""
	|p|
	p := Promise new.
	aBlock value: p.
	^p end.
! !

Object subclass: #PromiseChain
	instanceVariableNames: 'finalPromise basePromise'
	package: 'Promise'!
!PromiseChain commentStamp!
Not to be used directly. Create one only using `Promise>>#begin`.

## A sequence of activities

When you send `#begin` to a promise, it makes a new sequence object. Sending a cascade of `#then:else:` messages to the sequence object will set up a chain of activities each of which sends its result to the one following it. 

## Multiple sequences from the same base promise

When you send a `#begin` to an `PromiseChain`, it makes a new sequence object based on the original promise from which it was forked. This lets you setup multiple sequences in a single statement like this -

    aPromise
        begin    "sequence 1"
            then: ["blah1"] else: ["blah1"];
            then: ["blah2"] else: ["blah2"];
        begin    "sequence 2"
            then: ["blah3"] else: ["blah3"];
            then: ["blah4"] else: ["blah4"];!

!PromiseChain methodsFor: 'initialization'!

startingWith: aPromise
	basePromise := aPromise.
	finalPromise := aPromise.
	^self.
! !

!PromiseChain methodsFor: 'promise'!

asPromise
	^finalPromise
!

begin
	^PromiseChain startingWith: basePromise.
!

doesNotUnderstand: aMessage
	^aMessage sendTo: finalPromise.
!

then: onFulfilled
	^self then: onFulfilled else: nil
!

then: onFulfilled else: onRejected
	"
	When sent as a cascade to the same PromiseChain,
	it sets up a chain of activities where each activity 
	passes its result to the next one.
	"
	^(finalPromise := finalPromise then: onFulfilled else: onRejected)
! !

!PromiseChain class methodsFor: 'creating'!

startingWith: aPromise
	^self new startingWith: aPromise.
! !

Error subclass: #PromiseFailed
	instanceVariableNames: 'reason'
	package: 'Promise'!

!PromiseFailed methodsFor: 'initialization'!

initialize
	Error signal: 'Reason must be given for PromiseFailed using #reason:'.
!

reason: aReason
	reason := aReason.
! !

!PromiseFailed methodsFor: 'promise'!

reason
	^reason.
! !

!PromiseFailed class methodsFor: 'construction'!

reason: reason
	PromiseFailed new reason: reason.
! !

Error subclass: #PromiseTypeError
	instanceVariableNames: ''
	package: 'Promise'!

Error subclass: #PromiseValueNotAvailableYet
	instanceVariableNames: ''
	package: 'Promise'!

TestCase subclass: #TestPromise
	instanceVariableNames: ''
	package: 'Promise'!
!TestPromise commentStamp!
Poor coverage of the Promise/A+ specification!! This is work-in-progress.!

!TestPromise methodsFor: 'initialization'!

initialize
	Transcript register: ConsoleTranscript new.
! !

!TestPromise methodsFor: 'tests'!

debugger
	<debugger;>
!

test2121bFulfillAndReject
	|p fulfilled|
	self timeout: 100.
	p := Promise new.
	p then: [:v| fulfilled := true]
	  else: [:e| self assert fulfilled equals: false. self finished].
	p fulfill: true.
	p reject: true.
	[self finished] valueWithTimeout: 10.
!

test2121cFulfillAndRejectDelayed
	|p fulfilled|
	self timeout: 150.
	p := Promise new.
	p then: [:v| fulfilled := true]
	  else: [:e| self assert fulfilled equals: false. self finished].
	[p fulfill: true. p reject: true.] valueWithTimeout: 50.
	[self finished] valueWithTimeout: 100.
!

test2121dFulfillNowAndRejectDelayed
	|p fulfilled|
	self timeout: 150.
	p := Promise new.
	p then: [:v| fulfilled := true]
	  else: [:e| self assert fulfilled equals: false. self finished].
	p fulfill: true. 
	[p reject: true.] valueWithTimeout: 50.
	[self finished] valueWithTimeout: 100.
!

test2131bRejectAndFulfill
	|p rejected|
	self timeout: 100.
	p := Promise new.
	p then: [:v| self assert rejected equals: false. self finished]
 	  else: [:e| rejected := true].
	p reject: true.
	p fulfill: true.
	[self finished] valueWithTimeout: 10.
!

test2131cRejectAndFulfillDelayed
	|p rejected|
	self timeout: 150.
	p := Promise new.
	p then: [:v| self assert rejected equals: false. self finished]
 	  else: [:e| rejected := true].
	[p reject: true.
	 p fulfill: true.] valueWithTimeout: 50. 
	[self finished] valueWithTimeout: 100.
!

test2131dRejectNowAndFulfillDelayed
	|p rejected|
	self timeout: 150.
	p := Promise new.
	p then: [:v| self assert rejected equals: false. self finished]
 	  else: [:e| rejected := true].
	p reject: true.
	[p fulfill: true.] valueWithTimeout: 50. 
	[self finished] valueWithTimeout: 100.
!

test2221
	|p|
	self timeout: 100.
	p := Promise new.
	p then: [:v| self assert: v equals: 42. self finished].
	p fulfill: 42.
!

test2222a
	|p fulfilled|
	self timeout: 100.
	p := Promise new.
	p then: [:v| fulfilled := true. self finished].
	[self assert: fulfilled equals: false. self finished] valueWithTimeout: 50.
!

test2223a
	|p timesCalled|
	timesCalled := 0.
	self timeout: 100.
	p := Promise new; fulfill: 42; yourself.
	p then: [:v| 
		timesCalled := timesCalled + 1. 
		self assert: timesCalled equals: 1.
		self finished].
!

test2223b
	|p timesCalled|
	timesCalled := 0.
	self timeout: 100.
	p := Promise new.
	p then: [:v| 
		timesCalled := timesCalled + 1. 
		self assert: timesCalled equals: 1.
		self finished].
	p fulfill: 42; fulfill: 24.
!

test2223c
	|p timesCalled|
	timesCalled := 0.
	self timeout: 100.
	p := Promise new.
	p then: [:v| 
		timesCalled := timesCalled + 1. 
		self assert: timesCalled equals: 1.
		self finished].
	[p fulfill: 42; fulfill: 24] valueWithTimeout: 50.
!

test2223d
	|p timesCalled|
	timesCalled := 0.
	self timeout: 100.
	p := Promise new.
	p then: [:v| 
		timesCalled := timesCalled + 1. 
		self assert: timesCalled equals: 1.
		self finished].
	p fulfill: 42.
	[p fulfill: 24] valueWithTimeout: 50.
!

test2223e
	|p timesCalled|
	timesCalled := #(0 0 0).
	self timeout: 200.
	p := Promise new.
	p then: [:v| 
		timesCalled at: 1 put: 1 + (timesCalled at: 1).
		self assert: (timesCalled at: 1) equals: 1].
	[p then: [:v| 
		timesCalled at: 2 put: 1 + (timesCalled at: 2).
		self assert: (timesCalled at: 2) equals: 1]] valueWithTimeout: 50.
	[p then: [:v| 
		timesCalled at: 3 put: 1 + (timesCalled at: 3).
		self assert: (timesCalled at: 3) equals: 1]] valueWithTimeout: 100.
	[p fulfill: 42] valueWithTimeout: 150.
!

test2223f
	|p timesCalled|
	timesCalled := #(0 0).
	self timeout: 100.
	p := Promise new.
	p then: [:v| 
		timesCalled at: 1 put: 1 + (timesCalled at: 1).
		self assert: (timesCalled at: 1) equals: 1].
	p fulfill: 42.
	p then: [:v| 
		timesCalled at: 2 put: 1 + (timesCalled at: 2).
		self assert: (timesCalled at: 2) equals: 1.
		self finished].
!

test2231
	|p|
	self timeout: 100.
	p := Promise new.
	p then: nil else: [:v| self assert v equals: 42. self finished].
	p reject: 42.
	[self finished] valueWithTimeout: 10
!

test2232a
	|p rejected|
	self timeout: 100.
	p := Promise new.
	p then: nil else: [:v| self assert: rejected equals: true. self finished].
	[p reject: 42. rejected := true] valueWithTimeout: 50.
!

test2232b
	|p rejected|
	self timeout: 100.
	p := Promise new.
	p then: nil else: [:v| rejected := true. self finished].
	[self assert: rejected equals: false. self finished] valueWithTimeout: 50.
!

test2233a
	|p timesCalled|
	timesCalled := 0.
	self timeout: 100.
	p := Promise new; reject: 42; yourself.
	p then: nil else: [:v| 
		timesCalled := timesCalled + 1. 
		self assert: timesCalled equals: 1.
		self finished].
!

test2233b
	|p timesCalled|
	timesCalled := 0.
	self timeout: 100.
	p := Promise new.
	p then: nil else: [:v| 
		timesCalled := timesCalled + 1. 
		self assert: timesCalled equals: 1.
		self finished].
	p reject: 42; reject: 24.
!

test2233c
	|p timesCalled|
	timesCalled := 0.
	self timeout: 100.
	p := Promise new.
	p then: nil else: [:v| 
		timesCalled := timesCalled + 1. 
		self assert: timesCalled equals: 1.
		self finished].
	[p reject: 42; reject: 24] valueWithTimeout: 50.
!

test2233d
	|p timesCalled|
	timesCalled := 0.
	self timeout: 100.
	p := Promise new.
	p then: nil else: [:v| 
		timesCalled := timesCalled + 1. 
		self assert: timesCalled equals: 1.
		self finished].
	p reject: 42.
	[p fulfilreject: 24] valueWithTimeout: 50.
!

test2233e
	|p timesCalled|
	timesCalled := #(0 0 0).
	self timeout: 200.
	p := Promise new.
	p then: nil else: [:v| 
		timesCalled at: 1 put: 1 + (timesCalled at: 1).
		self assert: (timesCalled at: 1) equals: 1].
	[p then: nil else: [:v| 
		timesCalled at: 2 put: 1 + (timesCalled at: 2).
		self assert: (timesCalled at: 2) equals: 1]] valueWithTimeout: 50.
	[p then: nil else: [:v| 
		timesCalled at: 3 put: 1 + (timesCalled at: 3).
		self assert: (timesCalled at: 3) equals: 1]] valueWithTimeout: 100.
	[p reject: 42] valueWithTimeout: 150.
!

test2233f
	|p timesCalled|
	timesCalled := #(0 0).
	self timeout: 100.
	p := Promise new.
	p then: nil else: [:v| 
		timesCalled at: 1 put: 1 + (timesCalled at: 1).
		self assert: (timesCalled at: 1) equals: 1].
	p reject: 42.
	p then: nil else: [:v| 
		timesCalled at: 2 put: 1 + (timesCalled at: 2).
		self assert: (timesCalled at: 2) equals: 1.
		self finished].
!

testBlockPromise
	""
	self timeout: 100.
	(self async: [
		[:succ :fail| succ value: 42] asPromise
			then: [:v| self assert: v equals: 43. self finished.]
			else: [:e| self signalFailure: 'Simple Block promise failed!!']])
		valueWithTimeout: 0.
!

testComputation
	|p1 p2 psum|
	self timeout: 200.
	p1 := Promise new.
	p2 := Promise new.
	psum := p1 + p2.
	(self async: [psum then: [:v| self assert: v equals: 66. self finished.]]) valueWithTimeout: 150.
	[p1 fulfill: 43] valueWithTimeout: 50.
	[p2 fulfill: 24] valueWithTimeout: 100.
!

testSequence
	""
	self timeout: 100.
	(self async: [|p dbl|
		p := Promise new.
		dbl := [:y| y * 2].
		p begin 
			then: dbl; then: dbl; then: dbl;
		  	then: [:y| self assert: y equals: 42 * 8. self finished].
		p fulfill: 42.
	]) valueWithTimeout: 10.
! !

!Object methodsFor: '*Promise'!

asPromise
	^Promise new fulfill: self; yourself.
! !

!BlockClosure methodsFor: '*Promise'!

asPromise
	"Turns a block that takes two arguments - the callback and errback - 
	into a promise, whereby calling the callback will fulfill the promise
	and the errback will reject the promise."
	|p nargs|
	p := Promise new.
	[self value: p callback value: p errback] fork.
	^p.
! !

!IndexableCollection methodsFor: '*Promise'!

asPromise
	"Produces a Promise that promises the IndexableCollection 
	to be delivered with all members that are Promise instances
	resolved to their values."
	
	|p count processed step|
	processed := 0.
	count := self size.
	p := Promise new.
	step := [:y|
		processed := processed + 1.
		processed = count ifTrue: [p fulfill: y]].
	
	self withIndexDo: [:arg :ix|
		(arg isKindOf: Promise)
			ifTrue: [
				arg then: [:y| self at: ix put: y. step value: self]
					else: p errback]
			ifFalse: [step value: self]].
			
	^p.
! !

