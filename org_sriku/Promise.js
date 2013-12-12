define("org_sriku/Promise", ["amber_vm/smalltalk", "amber_vm/nil", "amber_vm/_st", "amber_core/Kernel-Objects", "amber_core/Kernel-Exceptions", "amber_core/SUnit", "amber_core/Kernel-Methods", "amber_core/Kernel-Collections"], function(smalltalk,nil,_st){
smalltalk.addPackage('Promise');
smalltalk.packages["Promise"].transport = {"type":"amd","amdNamespace":"org_sriku"};

smalltalk.addClass('Promise', smalltalk.Object, ['state', 'value', 'chain', 'callback', 'errback'], 'Promise');
smalltalk.Promise.comment="I promise to provide a value which is not available immediately. Using me, you can setup receivers for my value when it becomes available, or handlers for errors when they happen. You'll find me useful to work with asynchronous APIs.\x0a\x0aThe implementation and behaviour corresponds mostly to the [Promises/A+ specification], with adaptations for smalltalk. It also has some extra goodies like automatic method forwarding.\x0a\x0a[Promises/A+ specification]: http://promises-aplus.github.io/promises-spec/\x0a\x0a## Creating promises\x0a\x0aThis is just `Promise new` usually.\x0a\x0aOn occasion, it is useful to club a number of statements to build a promise. To do this use `Promise with: [:p| ...]`.\x0a\x0a## Fulfilling and rejecting promises\x0a\x0aUse `#fulfill:` and `#reject:` to do this. Usually, the fulfillment and rejection can be expected to be handled by some asynchronous API call. Many asynchronous JS API functions take `callback`/`errback` arguments. To support these you can get one-argument functions that either fulfill or reject a promise by sending `#callback` and `#errback` messages respectively. These blocks are cached once created, so there is no extra cost the second and subsequent times.\x0a\x0a## Triggering activities once a promise has been fulfilled or rejected\x0a\x0aUse a cascade of `#then:else:` messages to setup a number of activities all of which should be started or aborted depending on what happens to the activity represented by this promise.\x0a\x0a## Preparing a sequence of asynchronous actions\x0a\x0aCreate an `PromiseChain` by sending `#begin` to a `Promise` and use a cascade of `#then:else:` messages on the sequence object. Each activity corresponding to a `#then:else:` will pass its result to the one following it.\x0a\x0a## Multiple \x22threads\x22 of asynchronous activities\x0a\x0aSending the `#begin` message to an `PromiseChain` makes a new instance starting from the base promise on which the receiver was created. So using this, you can easily code up multiple \x22threads\x22 of activities. For example, if you have a promise `pr` that you want to be followed\x0aby two action sequences a1,a2,a3 and b1,b2,b3, you can do it like this -\x0a\x0a\x09pr \x0a\x09\x09begin \x0a\x09\x09\x09then: a1;\x0a\x09\x09\x09then: a2;\x0a\x09\x09\x09then: a3;\x0a\x09\x09begin\x0a\x09\x09\x09then: b1;\x0a\x09\x09\x09then: b2;\x0a\x09\x09\x09then: b3.\x0a\x09\x09\x0a## asPromise\x0a\x0aYou can send `#asPromise` to any object to wrap it in a `Promise` instance that will deliver its value to some client code.\x0a\x0a1. Sending `#asPromise` to a `Promise` instance will simply return `self`.\x0a\x0a2. Sending `#asPromise` to most objects will just result in a `Promise` instance that will deliver the object itself as is.\x0a\x0a3. IndexableCollection targets - When an `IndexableCollection` receives `#asPromise` it first examines whether the collection contains any `Promise` instances. If it does, then it returns a `Promise` instance that will deliver a collection which contains only resolved values. The receiving collection is modified in-place with the resolved values of the promises.\x0a\x0a4. BlockClosure targets - If you have a block with two arguments `callback` and `errback`, each of which is a one argument block, you can use `callback` and `errback` within some internal blocks to notify the completion or failure of the block. Given such a block, you can convert it into a promise using `#asPromise`.\x0a\x0a\x09    [:callback :errback | Transcript show: 'yes'. callback value: 42] asPromise\x0a\x09    \x09then: [:y| Transcript show: 'following up with ', y]\x0a\x09\x09\x0a5. Sending `#asPromise` to a `PromiseChain` will result in the final promise in the sequence.\x0a\x0a## A promise stands for the promised value (... mostly ;)\x0a\x0aYou can send a `Promise` instance messages that are intended for the value that it promises to produce. The result will be a promise that will be fulfilled once the receiving promise realizes the value, sends the message to it and fulfills the result promise with the return value of the method that handed the message.\x0a\x0aCode speaks clearer -\x0a\x0a    |p q|\x0a    p := Promise new.\x0a    q := (p tokenize: '/') inspect.\x0a    [p fulfill: 'path/to/somewhere'] valueWithTimeout: 2000.\x0a    \x22The inspector will open with an array after about 2 seconds.\x22\x0a\x0aNow, since `Promise` is a subclass of `Object`, there are already many methods provided for, which we might intend for the promised value instead of the promise itself. If you want to send a message to the promised value that `Object` itself understands, this auto-wrapping mechanism will not be triggered since `#doesNotUnderstand:` will not happen to the promise object. For these cases, use `#forward:` or `#forward:arguments:`, which will return a promise for the result of sending the selector with the given arguments to the value when it becomes available.\x0a\x0aRant: What I'd really like here is some way to trap messages and decide which ones to make promises out of and which ones to let the default `Object` behaviour take over.";
smalltalk.addMethod(
smalltalk.method({
selector: "adoptState:",
category: 'private',
fn: function (promise){
var self=this;
function $PromiseFailed(){return smalltalk.PromiseFailed||(typeof PromiseFailed=="undefined"?nil:PromiseFailed)}
function $PromiseValueNotAvailableYet(){return smalltalk.PromiseValueNotAvailableYet||(typeof PromiseValueNotAvailableYet=="undefined"?nil:PromiseValueNotAvailableYet)}
return smalltalk.withContext(function($ctx1) { 
_st((function(){
return smalltalk.withContext(function($ctx2) {
return _st((function(){
return smalltalk.withContext(function($ctx3) {
return self._fulfill_(_st(promise)._value());
}, function($ctx3) {$ctx3.fillBlock({},$ctx2,2)})}))._on_do_($PromiseFailed(),(function(e){
return smalltalk.withContext(function($ctx3) {
return self._reject_(_st(e)._reason());
}, function($ctx3) {$ctx3.fillBlock({e:e},$ctx2,3)})}));
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,1)})}))._on_do_($PromiseValueNotAvailableYet(),(function(e){
return smalltalk.withContext(function($ctx2) {
self["@state"]=(0);
self["@state"];
self["@value"]=nil;
self["@value"];
return _st(promise)._then_else_(self._callback(),self._errback());
}, function($ctx2) {$ctx2.fillBlock({e:e},$ctx1,4)})}));
$ctx1.sendIdx["on:do:"]=1;
return nil;
}, function($ctx1) {$ctx1.fill(self,"adoptState:",{promise:promise},smalltalk.Promise)})},
args: ["promise"],
source: "adoptState: promise\x0a\x09\x22Results in myself getting the current state of promise,\x0a\x09and a setup such that both our states will remain in sync\x0a\x09henceforth.\x22\x0a\x09[[self fulfill: promise value]\x0a\x09\x09on: PromiseFailed \x0a\x09\x09do: [:e| self reject: e reason.]]\x0a\x09\x09on: PromiseValueNotAvailableYet \x0a\x09\x09do: [:e| \x0a\x09\x09\x09state := 0. \x0a\x09\x09\x09value := nil. \x0a\x09\x09\x09promise then: self callback else: self errback.].\x0a\x09^nil.",
messageSends: ["on:do:", "fulfill:", "value", "reject:", "reason", "then:else:", "callback", "errback"],
referencedClasses: ["PromiseFailed", "PromiseValueNotAvailableYet"]
}),
smalltalk.Promise);

smalltalk.addMethod(
smalltalk.method({
selector: "asJSON",
category: 'overrides',
fn: function (){
var self=this;
return smalltalk.withContext(function($ctx1) { 
var $1;
$1=self._then_((function(v){
return smalltalk.withContext(function($ctx2) {
return _st(v)._asJSON();
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}));
return $1;
}, function($ctx1) {$ctx1.fill(self,"asJSON",{},smalltalk.Promise)})},
args: [],
source: "asJSON\x0a\x09^self then: [:v| v asJSON]",
messageSends: ["then:", "asJSON"],
referencedClasses: []
}),
smalltalk.Promise);

smalltalk.addMethod(
smalltalk.method({
selector: "asJSONString",
category: 'overrides',
fn: function (){
var self=this;
return smalltalk.withContext(function($ctx1) { 
var $1;
$1=self._then_((function(v){
return smalltalk.withContext(function($ctx2) {
return _st(v)._asJSONString();
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}));
return $1;
}, function($ctx1) {$ctx1.fill(self,"asJSONString",{},smalltalk.Promise)})},
args: [],
source: "asJSONString\x0a\x09^self then: [:v| v asJSONString]",
messageSends: ["then:", "asJSONString"],
referencedClasses: []
}),
smalltalk.Promise);

smalltalk.addMethod(
smalltalk.method({
selector: "asPromise",
category: 'promise',
fn: function (){
var self=this;
return smalltalk.withContext(function($ctx1) { 
return self;
}, function($ctx1) {$ctx1.fill(self,"asPromise",{},smalltalk.Promise)})},
args: [],
source: "asPromise\x0a\x09^self",
messageSends: [],
referencedClasses: []
}),
smalltalk.Promise);

smalltalk.addMethod(
smalltalk.method({
selector: "begin",
category: 'promise',
fn: function (){
var self=this;
function $PromiseChain(){return smalltalk.PromiseChain||(typeof PromiseChain=="undefined"?nil:PromiseChain)}
return smalltalk.withContext(function($ctx1) { 
var $1;
$1=_st($PromiseChain())._startingWith_(self);
return $1;
}, function($ctx1) {$ctx1.fill(self,"begin",{},smalltalk.Promise)})},
args: [],
source: "begin\x0a\x09\x22Restarts the sequence of asynchronous actions from the base promise.\x22\x0a\x09^PromiseChain startingWith: self.",
messageSends: ["startingWith:"],
referencedClasses: ["PromiseChain"]
}),
smalltalk.Promise);

smalltalk.addMethod(
smalltalk.method({
selector: "callback",
category: 'promise',
fn: function (){
var self=this;
return smalltalk.withContext(function($ctx1) { 
var $2,$1;
$2=self["@callback"];
if(($receiver = $2) == nil || $receiver == null){
self["@callback"]=(function(val){
return smalltalk.withContext(function($ctx2) {
return self._fulfill_(val);
}, function($ctx2) {$ctx2.fillBlock({val:val},$ctx1,2)})});
$1=self["@callback"];
} else {
$1=$2;
};
return $1;
}, function($ctx1) {$ctx1.fill(self,"callback",{},smalltalk.Promise)})},
args: [],
source: "callback\x0a\x09\x22You can fulfill a promise by calling its success callback\x0a\x09function, which is obtained by sending #callback to the\x0a\x09promise. I cache the callback/errback once created.\x22\x09\x0a\x09^callback ifNil: [callback := [:val| self fulfill: val]]",
messageSends: ["ifNil:", "fulfill:"],
referencedClasses: []
}),
smalltalk.Promise);

smalltalk.addMethod(
smalltalk.method({
selector: "commit",
category: 'private',
fn: function (){
var self=this;
return smalltalk.withContext(function($ctx1) { 
var $2,$1;
$2=_st(_st(self["@chain"])._size()).__gt((0));
$ctx1.sendIdx[">"]=1;
$1=_st($2).__and(_st(self["@state"]).__gt((0)));
if(smalltalk.assert($1)){
_st((function(){
return smalltalk.withContext(function($ctx2) {
return self._commitNow();
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,2)})}))._fork();
};
return self}, function($ctx1) {$ctx1.fill(self,"commit",{},smalltalk.Promise)})},
args: [],
source: "commit\x0a\x09\x22\x22\x0a\x09((chain size > 0) & (state > 0)) ifTrue: [[self commitNow] fork].",
messageSends: ["ifTrue:", "&", ">", "size", "fork", "commitNow"],
referencedClasses: []
}),
smalltalk.Promise);

smalltalk.addMethod(
smalltalk.method({
selector: "commitNow",
category: 'private',
fn: function (){
var self=this;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
function $Error(){return smalltalk.Error||(typeof Error=="undefined"?nil:Error)}
return smalltalk.withContext(function($ctx1) { 
var $1,$2;
_st(self["@chain"])._do_((function(step){
var action,promise2;
return smalltalk.withContext(function($ctx2) {
action=_st(step)._at_(self["@state"]);
$ctx2.sendIdx["at:"]=1;
action;
promise2=_st(step)._at_((3));
promise2;
$1=action;
if(($receiver = $1) == nil || $receiver == null){
$2=_st(self["@state"]).__eq((1));
if(smalltalk.assert($2)){
return _st(promise2)._fulfill_(self["@value"]);
} else {
return _st(promise2)._reject_(self["@value"]);
};
} else {
return _st((function(){
return smalltalk.withContext(function($ctx3) {
return _st((function(){
return smalltalk.withContext(function($ctx4) {
return _st($Promise())._resolve_value_(promise2,_st(action)._value_(self["@value"]));
}, function($ctx4) {$ctx4.fillBlock({},$ctx3,7)})}))._on_do_($Error(),_st(promise2)._errback());
}, function($ctx3) {$ctx3.fillBlock({},$ctx2,6)})}))._fork();
};
}, function($ctx2) {$ctx2.fillBlock({step:step,action:action,promise2:promise2},$ctx1,1)})}));
_st(self["@chain"])._removeFrom_to_((1),_st(self["@chain"])._size());
return self}, function($ctx1) {$ctx1.fill(self,"commitNow",{},smalltalk.Promise)})},
args: [],
source: "commitNow\x0a\x09\x22\x22\x0a\x09chain do: [ :step | \x0a\x09\x09|action promise2|\x0a\x09\x09action := step at: state.\x0a\x09\x09promise2 := step at: 3.\x0a\x09\x09action \x0a\x09\x09\x09ifNil: [\x0a\x09\x09\x09\x09state = 1 ifTrue: [promise2 fulfill: value]\x0a\x09\x09\x09\x09\x09\x09  ifFalse: [promise2 reject: value]]\x0a\x09\x09\x09ifNotNil: [\x0a\x09\x09\x09\x09[[Promise resolve: promise2 value: (action value: value)]\x0a\x09\x09\x09\x09\x09on: Error do: promise2 errback] fork]].\x0a\x09chain removeFrom: 1 to: chain size.",
messageSends: ["do:", "at:", "ifNil:ifNotNil:", "ifTrue:ifFalse:", "=", "fulfill:", "reject:", "fork", "on:do:", "resolve:value:", "value:", "errback", "removeFrom:to:", "size"],
referencedClasses: ["Promise", "Error"]
}),
smalltalk.Promise);

smalltalk.addMethod(
smalltalk.method({
selector: "description",
category: 'private',
fn: function (){
var self=this;
return smalltalk.withContext(function($ctx1) { 
var $5,$4,$3,$2,$1;
$5=_st("(Promise state=".__comma(self["@state"])).__comma(" value=");
$ctx1.sendIdx[","]=5;
$4=_st($5).__comma(self["@value"]);
$ctx1.sendIdx[","]=4;
$3=_st($4).__comma(" chain size=");
$ctx1.sendIdx[","]=3;
$2=_st($3).__comma(_st(self["@chain"])._size());
$ctx1.sendIdx[","]=2;
$1=_st($2).__comma(")");
$ctx1.sendIdx[","]=1;
return $1;
}, function($ctx1) {$ctx1.fill(self,"description",{},smalltalk.Promise)})},
args: [],
source: "description\x0a\x09\x22\x22\x0a\x09^'(Promise state=', state, ' value=', value, ' chain size=', chain size, ')'.",
messageSends: [",", "size"],
referencedClasses: []
}),
smalltalk.Promise);

smalltalk.addMethod(
smalltalk.method({
selector: "doesNotUnderstand:",
category: 'message handling',
fn: function (aMessage){
var self=this;
return smalltalk.withContext(function($ctx1) { 
var $1;
$1=self._forwardMessage_(aMessage);
return $1;
}, function($ctx1) {$ctx1.fill(self,"doesNotUnderstand:",{aMessage:aMessage},smalltalk.Promise)})},
args: ["aMessage"],
source: "doesNotUnderstand: aMessage\x0a\x09\x22Forward the message to the value, when it and all the\x0a\x09arguments of the message become available.\x0a\x09\x0a\x09This is likely very expressive for async programming, since\x0a\x09pretty much all of the language and environment now becomes\x0a\x09available asynchronously via promises. You can, for example,\x0a\x09take two promised numbers and add them to get a promise of\x0a\x09the result.\x22\x0a\x09^self forwardMessage: aMessage",
messageSends: ["forwardMessage:"],
referencedClasses: []
}),
smalltalk.Promise);

smalltalk.addMethod(
smalltalk.method({
selector: "errback",
category: 'promise',
fn: function (){
var self=this;
return smalltalk.withContext(function($ctx1) { 
var $2,$1;
$2=self["@errback"];
if(($receiver = $2) == nil || $receiver == null){
self["@errback"]=(function(e){
return smalltalk.withContext(function($ctx2) {
return self._reject_(e);
}, function($ctx2) {$ctx2.fillBlock({e:e},$ctx1,2)})});
$1=self["@errback"];
} else {
$1=$2;
};
return $1;
}, function($ctx1) {$ctx1.fill(self,"errback",{},smalltalk.Promise)})},
args: [],
source: "errback\x0a\x09\x22You can reject a promise by calling its errback function\x0a\x09obtained by sending the promise #errback. I cache the errback\x0a\x09once created.\x22\x0a\x09^errback ifNil: [errback := [:e| self reject: e]].",
messageSends: ["ifNil:", "reject:"],
referencedClasses: []
}),
smalltalk.Promise);

smalltalk.addMethod(
smalltalk.method({
selector: "forward:",
category: 'message handling',
fn: function (aMessageOrSelector){
var self=this;
function $Message(){return smalltalk.Message||(typeof Message=="undefined"?nil:Message)}
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
var $2,$3,$4,$1;
$2=_st(aMessageOrSelector)._isKindOf_($Message());
if(smalltalk.assert($2)){
$1=self._forwardMessage_(aMessageOrSelector);
} else {
$1=_st($Promise())._with_((function(p){
return smalltalk.withContext(function($ctx2) {
$3=self._begin();
_st($3)._then_((function(v){
return smalltalk.withContext(function($ctx3) {
return _st(v)._perform_(aMessageOrSelector);
}, function($ctx3) {$ctx3.fillBlock({v:v},$ctx2,4)})}));
$4=_st($3)._then_else_(_st(p)._callback(),_st(p)._errback());
return $4;
}, function($ctx2) {$ctx2.fillBlock({p:p},$ctx1,3)})}));
};
return $1;
}, function($ctx1) {$ctx1.fill(self,"forward:",{aMessageOrSelector:aMessageOrSelector},smalltalk.Promise)})},
args: ["aMessageOrSelector"],
source: "forward: aMessageOrSelector\x0a\x0a\x09^(aMessageOrSelector isKindOf: Message)\x0a\x09\x09ifTrue: [self forwardMessage: aMessageOrSelector]\x0a\x09\x09ifFalse: [Promise with: [:p|\x0a\x09\x09\x09\x09\x09self begin\x0a\x09\x09\x09\x09\x09\x09then: [:v| v perform: aMessageOrSelector];\x0a\x09\x09\x09\x09\x09\x09then: (p callback) else: (p errback)]]",
messageSends: ["ifTrue:ifFalse:", "isKindOf:", "forwardMessage:", "with:", "then:", "begin", "perform:", "then:else:", "callback", "errback"],
referencedClasses: ["Message", "Promise"]
}),
smalltalk.Promise);

smalltalk.addMethod(
smalltalk.method({
selector: "forward:arguments:",
category: 'message handling',
fn: function (aSelector,someArguments){
var self=this;
function $Message(){return smalltalk.Message||(typeof Message=="undefined"?nil:Message)}
return smalltalk.withContext(function($ctx1) { 
var $1;
$1=self._forwardMessage_(_st($Message())._selector_arguments_(aSelector,someArguments));
return $1;
}, function($ctx1) {$ctx1.fill(self,"forward:arguments:",{aSelector:aSelector,someArguments:someArguments},smalltalk.Promise)})},
args: ["aSelector", "someArguments"],
source: "forward: aSelector arguments: someArguments\x0a\x09^self forwardMessage: (Message selector: aSelector arguments: someArguments)",
messageSends: ["forwardMessage:", "selector:arguments:"],
referencedClasses: ["Message"]
}),
smalltalk.Promise);

smalltalk.addMethod(
smalltalk.method({
selector: "forwardMessage:",
category: 'message handling',
fn: function (aMessage){
var self=this;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
var $2,$3,$1;
$1=_st($Promise())._with_((function(p){
return smalltalk.withContext(function($ctx2) {
$2=_st(_st(_st(aMessage)._arguments())._asPromise())._begin();
_st($2)._then_((function(){
return smalltalk.withContext(function($ctx3) {
return self;
}, function($ctx3) {$ctx3.fillBlock({},$ctx2,2)})}));
$ctx2.sendIdx["then:"]=1;
_st($2)._then_((function(v){
return smalltalk.withContext(function($ctx3) {
return _st(aMessage)._sendTo_(v);
}, function($ctx3) {$ctx3.fillBlock({v:v},$ctx2,3)})}));
$3=_st($2)._then_else_(_st(p)._callback(),_st(p)._errback());
return $3;
}, function($ctx2) {$ctx2.fillBlock({p:p},$ctx1,1)})}));
return $1;
}, function($ctx1) {$ctx1.fill(self,"forwardMessage:",{aMessage:aMessage},smalltalk.Promise)})},
args: ["aMessage"],
source: "forwardMessage: aMessage\x0a\x0a\x09\x22See IndexableCollection>>asPromise.\x0a\x09When, say, an Array is sent #asPromise, you get a promise object\x0a\x09that will, when fulfilled, yield the same array with all entries\x0a\x09that are themselves promises resolved to their values in-place.\x22\x0a\x09\x0a\x09^Promise with: [:p|\x0a\x09\x09\x09\x09\x09aMessage arguments asPromise begin\x0a\x09\x09\x09\x09\x09\x09then: [self];\x0a\x09\x09\x09\x09\x09\x09then: [:v| aMessage sendTo: v];\x0a\x09\x09\x09\x09\x09\x09then: (p callback) else: (p errback)]",
messageSends: ["with:", "then:", "begin", "asPromise", "arguments", "sendTo:", "then:else:", "callback", "errback"],
referencedClasses: ["Promise"]
}),
smalltalk.Promise);

smalltalk.addMethod(
smalltalk.method({
selector: "fulfill:",
category: 'promise',
fn: function (aValue){
var self=this;
return smalltalk.withContext(function($ctx1) { 
var $1,$2;
$1=_st(self["@state"]).__eq((0));
if(smalltalk.assert($1)){
self["@state"]=(1);
self["@state"];
self["@value"]=aValue;
self["@value"];
};
self._commit();
$2=self["@value"];
return $2;
}, function($ctx1) {$ctx1.fill(self,"fulfill:",{aValue:aValue},smalltalk.Promise)})},
args: ["aValue"],
source: "fulfill: aValue\x0a\x09\x22\x22\x0a\x09state = 0 ifTrue: [\x0a\x09\x09\x22Change to RESOLVED state\x22\x0a\x09\x09state := 1. \x0a\x09\x09value := aValue].\x0a\x09self commit.\x0a\x09\x0a\x09\x22Important to return value so that further message sends can\x0a\x09directly address the value instead of the promise. If the\x0a\x09promise is already resolved or rejected, then this value will\x0a\x09either be the old value or the error reason.\x22\x0a\x09^value.",
messageSends: ["ifTrue:", "=", "commit"],
referencedClasses: []
}),
smalltalk.Promise);

smalltalk.addMethod(
smalltalk.method({
selector: "initialize",
category: 'initialization',
fn: function (){
var self=this;
return smalltalk.withContext(function($ctx1) { 
self["@state"]=(0);
self["@chain"]=[];
return self}, function($ctx1) {$ctx1.fill(self,"initialize",{},smalltalk.Promise)})},
args: [],
source: "initialize\x0a\x09state := 0.\x0a\x09chain := {}.",
messageSends: [],
referencedClasses: []
}),
smalltalk.Promise);

smalltalk.addMethod(
smalltalk.method({
selector: "inspect",
category: 'inspecting',
fn: function (){
var self=this;
return smalltalk.withContext(function($ctx1) { 
var $1;
$1=self._then_((function(v){
return smalltalk.withContext(function($ctx2) {
return _st(v)._inspect();
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}));
return $1;
}, function($ctx1) {$ctx1.fill(self,"inspect",{},smalltalk.Promise)})},
args: [],
source: "inspect\x0a\x09\x22Inspect the value. The promise itself is usually not of interest.\x22\x0a\x09^self then: [:v| v inspect]",
messageSends: ["then:", "inspect"],
referencedClasses: []
}),
smalltalk.Promise);

smalltalk.addMethod(
smalltalk.method({
selector: "inspectOn:",
category: 'inspecting',
fn: function (anInspector){
var self=this;
return smalltalk.withContext(function($ctx1) { 
var $1;
$1=self._then_((function(v){
return smalltalk.withContext(function($ctx2) {
return _st(v)._inspectOn_(anInspector);
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}));
return $1;
}, function($ctx1) {$ctx1.fill(self,"inspectOn:",{anInspector:anInspector},smalltalk.Promise)})},
args: ["anInspector"],
source: "inspectOn: anInspector\x0a\x09\x22Inspect the value. The promise itself is not usually of interest.\x22\x0a\x09^self then: [:v| v inspectOn: anInspector]",
messageSends: ["then:", "inspectOn:"],
referencedClasses: []
}),
smalltalk.Promise);

smalltalk.addMethod(
smalltalk.method({
selector: "printOn:",
category: 'overrides',
fn: function (aStream){
var self=this;
var p;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
var $2,$3,$5,$6,$4,$1;
$2=_st(aStream)._isKindOf_($Promise());
if(smalltalk.assert($2)){
p=_st($Promise())._new();
p;
$3=_st(aStream)._begin();
_st($3)._then_((function(){
return smalltalk.withContext(function($ctx2) {
return self;
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,2)})}));
$ctx1.sendIdx["then:"]=1;
$4=_st($3)._then_else_((function(v){
return smalltalk.withContext(function($ctx2) {
$5=p;
$6=_st(v)._printOn_(_st(aStream)._value());
$ctx2.sendIdx["printOn:"]=1;
return _st($5)._fulfill_($6);
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,3)})}),_st(p)._errback());
$4;
$1=p;
} else {
$1=self._then_((function(v){
return smalltalk.withContext(function($ctx2) {
return _st(v)._printOn_(aStream);
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,5)})}));
};
return $1;
}, function($ctx1) {$ctx1.fill(self,"printOn:",{aStream:aStream,p:p},smalltalk.Promise)})},
args: ["aStream"],
source: "printOn: aStream\x0a\x09|p|\x0a\x09^(aStream isKindOf: Promise)\x0a\x09\x09ifTrue: [\x0a\x09\x09\x09p := Promise new.\x0a\x09\x09\x09aStream begin\x0a\x09\x09\x09\x09then: [self];\x0a\x09\x09\x09\x09then: [:v| p fulfill: (v printOn: aStream value)] else: p errback.\x0a\x09\x09\x09p]\x0a\x09\x09ifFalse: [self then: [:v| v printOn: aStream]].",
messageSends: ["ifTrue:ifFalse:", "isKindOf:", "new", "then:", "begin", "then:else:", "fulfill:", "printOn:", "value", "errback"],
referencedClasses: ["Promise"]
}),
smalltalk.Promise);

smalltalk.addMethod(
smalltalk.method({
selector: "printString",
category: 'overrides',
fn: function (){
var self=this;
return smalltalk.withContext(function($ctx1) { 
var $1;
$1=self._then_((function(v){
return smalltalk.withContext(function($ctx2) {
return _st(v)._printString();
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}));
return $1;
}, function($ctx1) {$ctx1.fill(self,"printString",{},smalltalk.Promise)})},
args: [],
source: "printString\x0a\x09^self then: [:v| v printString]",
messageSends: ["then:", "printString"],
referencedClasses: []
}),
smalltalk.Promise);

smalltalk.addMethod(
smalltalk.method({
selector: "putOn:",
category: 'overrides',
fn: function (aStream){
var self=this;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
var $2,$5,$4,$3,$1;
$1=_st($Promise())._with_((function(p){
var stream;
return smalltalk.withContext(function($ctx2) {
stream=_st(aStream)._asPromise();
stream;
$2=_st(stream)._begin();
_st($2)._then_((function(){
return smalltalk.withContext(function($ctx3) {
return self;
}, function($ctx3) {$ctx3.fillBlock({},$ctx2,2)})}));
$3=_st($2)._then_else_((function(){
return smalltalk.withContext(function($ctx3) {
$5=self._value();
$ctx3.sendIdx["value"]=1;
$4=_st($5)._putOn_(_st(stream)._value());
return _st(p)._fulfill_($4);
}, function($ctx3) {$ctx3.fillBlock({},$ctx2,3)})}),_st(p)._errback());
return $3;
}, function($ctx2) {$ctx2.fillBlock({p:p,stream:stream},$ctx1,1)})}));
return $1;
}, function($ctx1) {$ctx1.fill(self,"putOn:",{aStream:aStream},smalltalk.Promise)})},
args: ["aStream"],
source: "putOn: aStream\x0a\x09^Promise with: [:p| |stream|\x0a\x09\x09stream := aStream asPromise.\x0a\x09\x09stream begin\x0a\x09\x09\x09then: [self];\x0a\x09\x09\x09then: [p fulfill: ((self value) putOn: (stream value))]\x0a\x09\x09\x09else: p errback.].",
messageSends: ["with:", "asPromise", "then:", "begin", "then:else:", "fulfill:", "putOn:", "value", "errback"],
referencedClasses: ["Promise"]
}),
smalltalk.Promise);

smalltalk.addMethod(
smalltalk.method({
selector: "reject:",
category: 'promise',
fn: function (aValue){
var self=this;
return smalltalk.withContext(function($ctx1) { 
var $1,$2;
$1=_st(self["@state"]).__eq((0));
if(smalltalk.assert($1)){
self["@state"]=(2);
self["@state"];
self["@value"]=aValue;
self["@value"];
};
self._commit();
$2=self["@value"];
return $2;
}, function($ctx1) {$ctx1.fill(self,"reject:",{aValue:aValue},smalltalk.Promise)})},
args: ["aValue"],
source: "reject: aValue\x0a\x09\x22\x22\x0a\x09state = 0 ifTrue: [\x0a\x09\x09\x22Change to REJECTED state.\x22\x0a\x09\x09state := 2.\x0a\x09\x09value := aValue].\x0a\x09self commit.\x0a\x09\x0a\x09\x22Important to return value, since it could be\x0a\x09an Error object, in which case it is useful to\x0a\x09be able to send signal to that object after\x0a\x09using it as the reason to reject a promise.\x0a\x09If the promise is already resolved, then this\x0a\x09value will be the resolved value instead of the\x0a\x09error.\x22\x0a\x09^value.",
messageSends: ["ifTrue:", "=", "commit"],
referencedClasses: []
}),
smalltalk.Promise);

smalltalk.addMethod(
smalltalk.method({
selector: "size",
category: 'overrides',
fn: function (){
var self=this;
return smalltalk.withContext(function($ctx1) { 
var $1;
$1=self._then_((function(v){
return smalltalk.withContext(function($ctx2) {
return _st(v)._size();
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}));
return $1;
}, function($ctx1) {$ctx1.fill(self,"size",{},smalltalk.Promise)})},
args: [],
source: "size\x0a\x09^self then: [:v| v size]",
messageSends: ["then:", "size"],
referencedClasses: []
}),
smalltalk.Promise);

smalltalk.addMethod(
smalltalk.method({
selector: "then:",
category: 'promise',
fn: function (onFulfilled){
var self=this;
return smalltalk.withContext(function($ctx1) { 
var $1;
$1=self._then_else_(onFulfilled,nil);
return $1;
}, function($ctx1) {$ctx1.fill(self,"then:",{onFulfilled:onFulfilled},smalltalk.Promise)})},
args: ["onFulfilled"],
source: "then: onFulfilled\x0a\x09^ self then: onFulfilled else: nil.",
messageSends: ["then:else:"],
referencedClasses: []
}),
smalltalk.Promise);

smalltalk.addMethod(
smalltalk.method({
selector: "then:else:",
category: 'promise',
fn: function (onFulfilled,onRejected){
var self=this;
var p;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
var $1;
p=_st($Promise())._new();
_st(self["@chain"])._add_([onFulfilled,onRejected,p]);
self._commit();
$1=p;
return $1;
}, function($ctx1) {$ctx1.fill(self,"then:else:",{onFulfilled:onFulfilled,onRejected:onRejected,p:p},smalltalk.Promise)})},
args: ["onFulfilled", "onRejected"],
source: "then: onFulfilled else: onRejected\x0a\x09\x22Adds one more client for the current promise.\x0a\x09A cascade of #then:else: messages can be used to trigger a number\x0a\x09of activities all of which require the results of this promise.\x0a\x09To construct a sequence of activities each of which is dependent\x0a\x09on the result of the preceding one in the sequence, use a cascade\x0a\x09of #then:else: messages on a `PromiseSequence` instance which can\x0a\x09be created by sending `#begin`.\x22\x0a\x09\x0a\x09|p|\x0a\x09\x0a\x09p := Promise new.\x0a\x09chain add: {onFulfilled. onRejected. p}.\x0a\x09self commit.\x0a\x09^p.",
messageSends: ["new", "add:", "commit"],
referencedClasses: ["Promise"]
}),
smalltalk.Promise);

smalltalk.addMethod(
smalltalk.method({
selector: "value",
category: 'promise',
fn: function (){
var self=this;
function $PromiseValueNotAvailableYet(){return smalltalk.PromiseValueNotAvailableYet||(typeof PromiseValueNotAvailableYet=="undefined"?nil:PromiseValueNotAvailableYet)}
function $PromiseFailed(){return smalltalk.PromiseFailed||(typeof PromiseFailed=="undefined"?nil:PromiseFailed)}
return smalltalk.withContext(function($ctx1) { 
var $1,$2,$3,$4;
$1=_st(self["@state"]).__eq((1));
$ctx1.sendIdx["="]=1;
if(smalltalk.assert($1)){
$2=self["@value"];
return $2;
};
$3=_st(self["@state"]).__eq((0));
if(smalltalk.assert($3)){
$4=_st($PromiseValueNotAvailableYet())._signal();
$ctx1.sendIdx["signal"]=1;
return $4;
};
_st(_st($PromiseFailed())._reason_(self["@value"]))._signal();
return self}, function($ctx1) {$ctx1.fill(self,"value",{},smalltalk.Promise)})},
args: [],
source: "value\x0a\x09\x22\x22\x0a\x09state = 1 ifTrue: [^value].\x0a\x09state = 0 ifTrue: [^PromiseValueNotAvailableYet signal].\x0a\x09(PromiseFailed reason: value) signal.",
messageSends: ["ifTrue:", "=", "signal", "reason:"],
referencedClasses: ["PromiseValueNotAvailableYet", "PromiseFailed"]
}),
smalltalk.Promise);


smalltalk.addMethod(
smalltalk.method({
selector: "resolve:value:",
category: 'promise',
fn: function (promise,x){
var self=this;
function $PromiseTypeError(){return smalltalk.PromiseTypeError||(typeof PromiseTypeError=="undefined"?nil:PromiseTypeError)}
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
function $Error(){return smalltalk.Error||(typeof Error=="undefined"?nil:Error)}
return smalltalk.withContext(function($ctx1) { 
var $1,$2,$3,$4,$5,$6,$7;
$1=_st(promise).__eq_eq(x);
if(smalltalk.assert($1)){
$2=_st($PromiseTypeError())._signal();
return $2;
};
$3=_st(x)._isKindOf_($Promise());
if(smalltalk.assert($3)){
$4=_st(promise)._adoptState_(_st(x)._end());
return $4;
};
_st((function(){
return smalltalk.withContext(function($ctx2) {
$5=_st(x)._respondsTo_("then:else:");
if(smalltalk.assert($5)){
$6=(function(y){
return smalltalk.withContext(function($ctx3) {
return _st($Promise())._resolve_value_(promise,y);
}, function($ctx3) {$ctx3.fillBlock({y:y},$ctx2,5)})});
$7=_st(promise)._errback();
$ctx2.sendIdx["errback"]=1;
return _st(x)._then_else_($6,$7);
} else {
return _st(promise)._fulfill_(x);
};
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,3)})}))._on_do_($Error(),_st(promise)._errback());
return nil;
}, function($ctx1) {$ctx1.fill(self,"resolve:value:",{promise:promise,x:x},smalltalk.Promise.klass)})},
args: ["promise", "x"],
source: "resolve: promise value: x\x0a\x09\x22\x0a\x09From: http://promises-aplus.github.io/promises-spec/#notes\x0a\x09\x0a\x09If promise and x refer to the same object, reject promise with a TypeError as the reason.\x0a\x09If x is a promise, adopt its state 3.4:\x0a\x09\x09If x is pending, promise must remain pending until x is fulfilled or rejected.\x0a\x09\x09If/when x is fulfilled, fulfill promise with the same value.\x0a\x09\x09If/when x is rejected, reject promise with the same reason.\x0a\x09Otherwise, if x is an object or function,\x0a\x09\x09Let then be x.then. 3.5\x0a\x09\x09If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.\x0a\x09\x09If then is a function, call it with x as this, first argument resolvePromise, and second argument rejectPromise, where:\x0a\x09\x09\x09If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).\x0a\x09\x09\x09If/when rejectPromise is called with a reason r, reject promise with r.\x0a\x09\x09\x09If both resolvePromise and rejectPromise are called, or multiple calls to the same argument are made, the first call takes precedence, and any further calls are ignored.\x0a\x09\x09\x09If calling then throws an exception e,\x0a\x09\x09\x09\x09If resolvePromise or rejectPromise have been called, ignore it.\x0a\x09\x09\x09\x09Otherwise, reject promise with e as the reason.\x0a\x09\x09If then is not a function, fulfill promise with x.\x0a\x09If x is not an object or function, fulfill promise with x.\x09\x0a\x09\x22\x0a\x0a\x09promise == x ifTrue: [^PromiseTypeError signal].\x0a\x09(x isKindOf: Promise) ifTrue: [^promise adoptState: x end].\x0a\x09[( x respondsTo: #then:else: )\x0a\x09\x09ifTrue: [x \x09then: [:y| Promise resolve: promise value: y]\x0a\x09\x09\x09\x09   \x09else: promise errback]\x0a\x09\x09ifFalse: [promise fulfill: x]]\x0a\x09\x09on: Error do: promise errback.\x0a\x09^nil.",
messageSends: ["ifTrue:", "==", "signal", "isKindOf:", "adoptState:", "end", "on:do:", "ifTrue:ifFalse:", "respondsTo:", "then:else:", "resolve:value:", "errback", "fulfill:"],
referencedClasses: ["PromiseTypeError", "Promise", "Error"]
}),
smalltalk.Promise.klass);

smalltalk.addMethod(
smalltalk.method({
selector: "with:",
category: 'promise',
fn: function (aBlock){
var self=this;
var p;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
var $1;
p=_st($Promise())._new();
_st(aBlock)._value_(p);
$1=_st(p)._end();
return $1;
}, function($ctx1) {$ctx1.fill(self,"with:",{aBlock:aBlock,p:p},smalltalk.Promise.klass)})},
args: ["aBlock"],
source: "with: aBlock\x0a\x09\x22\x22\x0a\x09|p|\x0a\x09p := Promise new.\x0a\x09aBlock value: p.\x0a\x09^p end.",
messageSends: ["new", "value:", "end"],
referencedClasses: ["Promise"]
}),
smalltalk.Promise.klass);


smalltalk.addClass('PromiseChain', smalltalk.Object, ['finalPromise', 'basePromise'], 'Promise');
smalltalk.PromiseChain.comment="Not to be used directly. Create one only using `Promise>>#begin`.\x0a\x0a## A sequence of activities\x0a\x0aWhen you send `#begin` to a promise, it makes a new sequence object. Sending a cascade of `#then:else:` messages to the sequence object will set up a chain of activities each of which sends its result to the one following it. \x0a\x0a## Multiple sequences from the same base promise\x0a\x0aWhen you send a `#begin` to an `PromiseChain`, it makes a new sequence object based on the original promise from which it was forked. This lets you setup multiple sequences in a single statement like this -\x0a\x0a    aPromise\x0a        begin    \x22sequence 1\x22\x0a            then: [\x22blah1\x22] else: [\x22blah1\x22];\x0a            then: [\x22blah2\x22] else: [\x22blah2\x22];\x0a        begin    \x22sequence 2\x22\x0a            then: [\x22blah3\x22] else: [\x22blah3\x22];\x0a            then: [\x22blah4\x22] else: [\x22blah4\x22];";
smalltalk.addMethod(
smalltalk.method({
selector: "asPromise",
category: 'promise',
fn: function (){
var self=this;
return smalltalk.withContext(function($ctx1) { 
var $1;
$1=self["@finalPromise"];
return $1;
}, function($ctx1) {$ctx1.fill(self,"asPromise",{},smalltalk.PromiseChain)})},
args: [],
source: "asPromise\x0a\x09^finalPromise",
messageSends: [],
referencedClasses: []
}),
smalltalk.PromiseChain);

smalltalk.addMethod(
smalltalk.method({
selector: "begin",
category: 'promise',
fn: function (){
var self=this;
function $PromiseChain(){return smalltalk.PromiseChain||(typeof PromiseChain=="undefined"?nil:PromiseChain)}
return smalltalk.withContext(function($ctx1) { 
var $1;
$1=_st($PromiseChain())._startingWith_(self["@basePromise"]);
return $1;
}, function($ctx1) {$ctx1.fill(self,"begin",{},smalltalk.PromiseChain)})},
args: [],
source: "begin\x0a\x09^PromiseChain startingWith: basePromise.",
messageSends: ["startingWith:"],
referencedClasses: ["PromiseChain"]
}),
smalltalk.PromiseChain);

smalltalk.addMethod(
smalltalk.method({
selector: "doesNotUnderstand:",
category: 'promise',
fn: function (aMessage){
var self=this;
return smalltalk.withContext(function($ctx1) { 
var $1;
$1=_st(aMessage)._sendTo_(self["@finalPromise"]);
return $1;
}, function($ctx1) {$ctx1.fill(self,"doesNotUnderstand:",{aMessage:aMessage},smalltalk.PromiseChain)})},
args: ["aMessage"],
source: "doesNotUnderstand: aMessage\x0a\x09^aMessage sendTo: finalPromise.",
messageSends: ["sendTo:"],
referencedClasses: []
}),
smalltalk.PromiseChain);

smalltalk.addMethod(
smalltalk.method({
selector: "startingWith:",
category: 'initialization',
fn: function (aPromise){
var self=this;
return smalltalk.withContext(function($ctx1) { 
self["@basePromise"]=aPromise;
self["@finalPromise"]=aPromise;
return self;
}, function($ctx1) {$ctx1.fill(self,"startingWith:",{aPromise:aPromise},smalltalk.PromiseChain)})},
args: ["aPromise"],
source: "startingWith: aPromise\x0a\x09basePromise := aPromise.\x0a\x09finalPromise := aPromise.\x0a\x09^self.",
messageSends: [],
referencedClasses: []
}),
smalltalk.PromiseChain);

smalltalk.addMethod(
smalltalk.method({
selector: "then:",
category: 'promise',
fn: function (onFulfilled){
var self=this;
return smalltalk.withContext(function($ctx1) { 
var $1;
$1=self._then_else_(onFulfilled,nil);
return $1;
}, function($ctx1) {$ctx1.fill(self,"then:",{onFulfilled:onFulfilled},smalltalk.PromiseChain)})},
args: ["onFulfilled"],
source: "then: onFulfilled\x0a\x09^self then: onFulfilled else: nil",
messageSends: ["then:else:"],
referencedClasses: []
}),
smalltalk.PromiseChain);

smalltalk.addMethod(
smalltalk.method({
selector: "then:else:",
category: 'promise',
fn: function (onFulfilled,onRejected){
var self=this;
return smalltalk.withContext(function($ctx1) { 
var $1;
self["@finalPromise"]=_st(self["@finalPromise"])._then_else_(onFulfilled,onRejected);
$1=self["@finalPromise"];
return $1;
}, function($ctx1) {$ctx1.fill(self,"then:else:",{onFulfilled:onFulfilled,onRejected:onRejected},smalltalk.PromiseChain)})},
args: ["onFulfilled", "onRejected"],
source: "then: onFulfilled else: onRejected\x0a\x09\x22\x0a\x09When sent as a cascade to the same PromiseChain,\x0a\x09it sets up a chain of activities where each activity \x0a\x09passes its result to the next one.\x0a\x09\x22\x0a\x09^(finalPromise := finalPromise then: onFulfilled else: onRejected)",
messageSends: ["then:else:"],
referencedClasses: []
}),
smalltalk.PromiseChain);


smalltalk.addMethod(
smalltalk.method({
selector: "startingWith:",
category: 'creating',
fn: function (aPromise){
var self=this;
return smalltalk.withContext(function($ctx1) { 
var $1;
$1=_st(self._new())._startingWith_(aPromise);
return $1;
}, function($ctx1) {$ctx1.fill(self,"startingWith:",{aPromise:aPromise},smalltalk.PromiseChain.klass)})},
args: ["aPromise"],
source: "startingWith: aPromise\x0a\x09^self new startingWith: aPromise.",
messageSends: ["startingWith:", "new"],
referencedClasses: []
}),
smalltalk.PromiseChain.klass);


smalltalk.addClass('PromiseFailed', smalltalk.Error, ['reason'], 'Promise');
smalltalk.addMethod(
smalltalk.method({
selector: "initialize",
category: 'initialization',
fn: function (){
var self=this;
function $Error(){return smalltalk.Error||(typeof Error=="undefined"?nil:Error)}
return smalltalk.withContext(function($ctx1) { 
_st($Error())._signal_("Reason must be given for PromiseFailed using #reason:");
return self}, function($ctx1) {$ctx1.fill(self,"initialize",{},smalltalk.PromiseFailed)})},
args: [],
source: "initialize\x0a\x09Error signal: 'Reason must be given for PromiseFailed using #reason:'.",
messageSends: ["signal:"],
referencedClasses: ["Error"]
}),
smalltalk.PromiseFailed);

smalltalk.addMethod(
smalltalk.method({
selector: "reason",
category: 'promise',
fn: function (){
var self=this;
return smalltalk.withContext(function($ctx1) { 
var $1;
$1=self["@reason"];
return $1;
}, function($ctx1) {$ctx1.fill(self,"reason",{},smalltalk.PromiseFailed)})},
args: [],
source: "reason\x0a\x09^reason.",
messageSends: [],
referencedClasses: []
}),
smalltalk.PromiseFailed);

smalltalk.addMethod(
smalltalk.method({
selector: "reason:",
category: 'initialization',
fn: function (aReason){
var self=this;
return smalltalk.withContext(function($ctx1) { 
self["@reason"]=aReason;
return self}, function($ctx1) {$ctx1.fill(self,"reason:",{aReason:aReason},smalltalk.PromiseFailed)})},
args: ["aReason"],
source: "reason: aReason\x0a\x09reason := aReason.",
messageSends: [],
referencedClasses: []
}),
smalltalk.PromiseFailed);


smalltalk.addMethod(
smalltalk.method({
selector: "reason:",
category: 'construction',
fn: function (reason){
var self=this;
function $PromiseFailed(){return smalltalk.PromiseFailed||(typeof PromiseFailed=="undefined"?nil:PromiseFailed)}
return smalltalk.withContext(function($ctx1) { 
_st(_st($PromiseFailed())._new())._reason_(reason);
return self}, function($ctx1) {$ctx1.fill(self,"reason:",{reason:reason},smalltalk.PromiseFailed.klass)})},
args: ["reason"],
source: "reason: reason\x0a\x09PromiseFailed new reason: reason.",
messageSends: ["reason:", "new"],
referencedClasses: ["PromiseFailed"]
}),
smalltalk.PromiseFailed.klass);


smalltalk.addClass('PromiseTypeError', smalltalk.Error, [], 'Promise');


smalltalk.addClass('PromiseValueNotAvailableYet', smalltalk.Error, [], 'Promise');


smalltalk.addClass('TestPromise', smalltalk.TestCase, [], 'Promise');
smalltalk.TestPromise.comment="Poor coverage of the Promise/A+ specification! This is work-in-progress.";
smalltalk.addMethod(
smalltalk.method({
selector: "debugger",
category: 'tests',
fn: function (){
var self=this;
return smalltalk.withContext(function($ctx1) { 
debugger;;
return self}, function($ctx1) {$ctx1.fill(self,"debugger",{},smalltalk.TestPromise)})},
args: [],
source: "debugger\x0a\x09<debugger;>",
messageSends: [],
referencedClasses: []
}),
smalltalk.TestPromise);

smalltalk.addMethod(
smalltalk.method({
selector: "initialize",
category: 'initialization',
fn: function (){
var self=this;
function $Transcript(){return smalltalk.Transcript||(typeof Transcript=="undefined"?nil:Transcript)}
function $ConsoleTranscript(){return smalltalk.ConsoleTranscript||(typeof ConsoleTranscript=="undefined"?nil:ConsoleTranscript)}
return smalltalk.withContext(function($ctx1) { 
_st($Transcript())._register_(_st($ConsoleTranscript())._new());
return self}, function($ctx1) {$ctx1.fill(self,"initialize",{},smalltalk.TestPromise)})},
args: [],
source: "initialize\x0a\x09Transcript register: ConsoleTranscript new.",
messageSends: ["register:", "new"],
referencedClasses: ["Transcript", "ConsoleTranscript"]
}),
smalltalk.TestPromise);

smalltalk.addMethod(
smalltalk.method({
selector: "test2121bFulfillAndReject",
category: 'tests',
fn: function (){
var self=this;
var p,fulfilled;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
self._timeout_((100));
p=_st($Promise())._new();
_st(p)._then_else_((function(v){
return smalltalk.withContext(function($ctx2) {
fulfilled=true;
return fulfilled;
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}),(function(e){
return smalltalk.withContext(function($ctx2) {
_st(_st(self._assert())._fulfilled())._equals_(false);
return self._finished();
$ctx2.sendIdx["finished"]=1;
}, function($ctx2) {$ctx2.fillBlock({e:e},$ctx1,2)})}));
_st(p)._fulfill_(true);
_st(p)._reject_(true);
_st((function(){
return smalltalk.withContext(function($ctx2) {
return self._finished();
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,3)})}))._valueWithTimeout_((10));
return self}, function($ctx1) {$ctx1.fill(self,"test2121bFulfillAndReject",{p:p,fulfilled:fulfilled},smalltalk.TestPromise)})},
args: [],
source: "test2121bFulfillAndReject\x0a\x09|p fulfilled|\x0a\x09self timeout: 100.\x0a\x09p := Promise new.\x0a\x09p then: [:v| fulfilled := true]\x0a\x09  else: [:e| self assert fulfilled equals: false. self finished].\x0a\x09p fulfill: true.\x0a\x09p reject: true.\x0a\x09[self finished] valueWithTimeout: 10.",
messageSends: ["timeout:", "new", "then:else:", "equals:", "fulfilled", "assert", "finished", "fulfill:", "reject:", "valueWithTimeout:"],
referencedClasses: ["Promise"]
}),
smalltalk.TestPromise);

smalltalk.addMethod(
smalltalk.method({
selector: "test2121cFulfillAndRejectDelayed",
category: 'tests',
fn: function (){
var self=this;
var p,fulfilled;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
self._timeout_((150));
p=_st($Promise())._new();
_st(p)._then_else_((function(v){
return smalltalk.withContext(function($ctx2) {
fulfilled=true;
return fulfilled;
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}),(function(e){
return smalltalk.withContext(function($ctx2) {
_st(_st(self._assert())._fulfilled())._equals_(false);
return self._finished();
$ctx2.sendIdx["finished"]=1;
}, function($ctx2) {$ctx2.fillBlock({e:e},$ctx1,2)})}));
_st((function(){
return smalltalk.withContext(function($ctx2) {
_st(p)._fulfill_(true);
return _st(p)._reject_(true);
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,3)})}))._valueWithTimeout_((50));
$ctx1.sendIdx["valueWithTimeout:"]=1;
_st((function(){
return smalltalk.withContext(function($ctx2) {
return self._finished();
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,4)})}))._valueWithTimeout_((100));
return self}, function($ctx1) {$ctx1.fill(self,"test2121cFulfillAndRejectDelayed",{p:p,fulfilled:fulfilled},smalltalk.TestPromise)})},
args: [],
source: "test2121cFulfillAndRejectDelayed\x0a\x09|p fulfilled|\x0a\x09self timeout: 150.\x0a\x09p := Promise new.\x0a\x09p then: [:v| fulfilled := true]\x0a\x09  else: [:e| self assert fulfilled equals: false. self finished].\x0a\x09[p fulfill: true. p reject: true.] valueWithTimeout: 50.\x0a\x09[self finished] valueWithTimeout: 100.",
messageSends: ["timeout:", "new", "then:else:", "equals:", "fulfilled", "assert", "finished", "valueWithTimeout:", "fulfill:", "reject:"],
referencedClasses: ["Promise"]
}),
smalltalk.TestPromise);

smalltalk.addMethod(
smalltalk.method({
selector: "test2121dFulfillNowAndRejectDelayed",
category: 'tests',
fn: function (){
var self=this;
var p,fulfilled;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
self._timeout_((150));
p=_st($Promise())._new();
_st(p)._then_else_((function(v){
return smalltalk.withContext(function($ctx2) {
fulfilled=true;
return fulfilled;
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}),(function(e){
return smalltalk.withContext(function($ctx2) {
_st(_st(self._assert())._fulfilled())._equals_(false);
return self._finished();
$ctx2.sendIdx["finished"]=1;
}, function($ctx2) {$ctx2.fillBlock({e:e},$ctx1,2)})}));
_st(p)._fulfill_(true);
_st((function(){
return smalltalk.withContext(function($ctx2) {
return _st(p)._reject_(true);
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,3)})}))._valueWithTimeout_((50));
$ctx1.sendIdx["valueWithTimeout:"]=1;
_st((function(){
return smalltalk.withContext(function($ctx2) {
return self._finished();
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,4)})}))._valueWithTimeout_((100));
return self}, function($ctx1) {$ctx1.fill(self,"test2121dFulfillNowAndRejectDelayed",{p:p,fulfilled:fulfilled},smalltalk.TestPromise)})},
args: [],
source: "test2121dFulfillNowAndRejectDelayed\x0a\x09|p fulfilled|\x0a\x09self timeout: 150.\x0a\x09p := Promise new.\x0a\x09p then: [:v| fulfilled := true]\x0a\x09  else: [:e| self assert fulfilled equals: false. self finished].\x0a\x09p fulfill: true. \x0a\x09[p reject: true.] valueWithTimeout: 50.\x0a\x09[self finished] valueWithTimeout: 100.",
messageSends: ["timeout:", "new", "then:else:", "equals:", "fulfilled", "assert", "finished", "fulfill:", "valueWithTimeout:", "reject:"],
referencedClasses: ["Promise"]
}),
smalltalk.TestPromise);

smalltalk.addMethod(
smalltalk.method({
selector: "test2131bRejectAndFulfill",
category: 'tests',
fn: function (){
var self=this;
var p,rejected;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
self._timeout_((100));
p=_st($Promise())._new();
_st(p)._then_else_((function(v){
return smalltalk.withContext(function($ctx2) {
_st(_st(self._assert())._rejected())._equals_(false);
return self._finished();
$ctx2.sendIdx["finished"]=1;
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}),(function(e){
return smalltalk.withContext(function($ctx2) {
rejected=true;
return rejected;
}, function($ctx2) {$ctx2.fillBlock({e:e},$ctx1,2)})}));
_st(p)._reject_(true);
_st(p)._fulfill_(true);
_st((function(){
return smalltalk.withContext(function($ctx2) {
return self._finished();
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,3)})}))._valueWithTimeout_((10));
return self}, function($ctx1) {$ctx1.fill(self,"test2131bRejectAndFulfill",{p:p,rejected:rejected},smalltalk.TestPromise)})},
args: [],
source: "test2131bRejectAndFulfill\x0a\x09|p rejected|\x0a\x09self timeout: 100.\x0a\x09p := Promise new.\x0a\x09p then: [:v| self assert rejected equals: false. self finished]\x0a \x09  else: [:e| rejected := true].\x0a\x09p reject: true.\x0a\x09p fulfill: true.\x0a\x09[self finished] valueWithTimeout: 10.",
messageSends: ["timeout:", "new", "then:else:", "equals:", "rejected", "assert", "finished", "reject:", "fulfill:", "valueWithTimeout:"],
referencedClasses: ["Promise"]
}),
smalltalk.TestPromise);

smalltalk.addMethod(
smalltalk.method({
selector: "test2131cRejectAndFulfillDelayed",
category: 'tests',
fn: function (){
var self=this;
var p,rejected;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
self._timeout_((150));
p=_st($Promise())._new();
_st(p)._then_else_((function(v){
return smalltalk.withContext(function($ctx2) {
_st(_st(self._assert())._rejected())._equals_(false);
return self._finished();
$ctx2.sendIdx["finished"]=1;
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}),(function(e){
return smalltalk.withContext(function($ctx2) {
rejected=true;
return rejected;
}, function($ctx2) {$ctx2.fillBlock({e:e},$ctx1,2)})}));
_st((function(){
return smalltalk.withContext(function($ctx2) {
_st(p)._reject_(true);
return _st(p)._fulfill_(true);
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,3)})}))._valueWithTimeout_((50));
$ctx1.sendIdx["valueWithTimeout:"]=1;
_st((function(){
return smalltalk.withContext(function($ctx2) {
return self._finished();
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,4)})}))._valueWithTimeout_((100));
return self}, function($ctx1) {$ctx1.fill(self,"test2131cRejectAndFulfillDelayed",{p:p,rejected:rejected},smalltalk.TestPromise)})},
args: [],
source: "test2131cRejectAndFulfillDelayed\x0a\x09|p rejected|\x0a\x09self timeout: 150.\x0a\x09p := Promise new.\x0a\x09p then: [:v| self assert rejected equals: false. self finished]\x0a \x09  else: [:e| rejected := true].\x0a\x09[p reject: true.\x0a\x09 p fulfill: true.] valueWithTimeout: 50. \x0a\x09[self finished] valueWithTimeout: 100.",
messageSends: ["timeout:", "new", "then:else:", "equals:", "rejected", "assert", "finished", "valueWithTimeout:", "reject:", "fulfill:"],
referencedClasses: ["Promise"]
}),
smalltalk.TestPromise);

smalltalk.addMethod(
smalltalk.method({
selector: "test2131dRejectNowAndFulfillDelayed",
category: 'tests',
fn: function (){
var self=this;
var p,rejected;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
self._timeout_((150));
p=_st($Promise())._new();
_st(p)._then_else_((function(v){
return smalltalk.withContext(function($ctx2) {
_st(_st(self._assert())._rejected())._equals_(false);
return self._finished();
$ctx2.sendIdx["finished"]=1;
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}),(function(e){
return smalltalk.withContext(function($ctx2) {
rejected=true;
return rejected;
}, function($ctx2) {$ctx2.fillBlock({e:e},$ctx1,2)})}));
_st(p)._reject_(true);
_st((function(){
return smalltalk.withContext(function($ctx2) {
return _st(p)._fulfill_(true);
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,3)})}))._valueWithTimeout_((50));
$ctx1.sendIdx["valueWithTimeout:"]=1;
_st((function(){
return smalltalk.withContext(function($ctx2) {
return self._finished();
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,4)})}))._valueWithTimeout_((100));
return self}, function($ctx1) {$ctx1.fill(self,"test2131dRejectNowAndFulfillDelayed",{p:p,rejected:rejected},smalltalk.TestPromise)})},
args: [],
source: "test2131dRejectNowAndFulfillDelayed\x0a\x09|p rejected|\x0a\x09self timeout: 150.\x0a\x09p := Promise new.\x0a\x09p then: [:v| self assert rejected equals: false. self finished]\x0a \x09  else: [:e| rejected := true].\x0a\x09p reject: true.\x0a\x09[p fulfill: true.] valueWithTimeout: 50. \x0a\x09[self finished] valueWithTimeout: 100.",
messageSends: ["timeout:", "new", "then:else:", "equals:", "rejected", "assert", "finished", "reject:", "valueWithTimeout:", "fulfill:"],
referencedClasses: ["Promise"]
}),
smalltalk.TestPromise);

smalltalk.addMethod(
smalltalk.method({
selector: "test2221",
category: 'tests',
fn: function (){
var self=this;
var p;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
self._timeout_((100));
p=_st($Promise())._new();
_st(p)._then_((function(v){
return smalltalk.withContext(function($ctx2) {
self._assert_equals_(v,(42));
return self._finished();
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}));
_st(p)._fulfill_((42));
return self}, function($ctx1) {$ctx1.fill(self,"test2221",{p:p},smalltalk.TestPromise)})},
args: [],
source: "test2221\x0a\x09|p|\x0a\x09self timeout: 100.\x0a\x09p := Promise new.\x0a\x09p then: [:v| self assert: v equals: 42. self finished].\x0a\x09p fulfill: 42.",
messageSends: ["timeout:", "new", "then:", "assert:equals:", "finished", "fulfill:"],
referencedClasses: ["Promise"]
}),
smalltalk.TestPromise);

smalltalk.addMethod(
smalltalk.method({
selector: "test2222a",
category: 'tests',
fn: function (){
var self=this;
var p,fulfilled;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
self._timeout_((100));
p=_st($Promise())._new();
_st(p)._then_((function(v){
return smalltalk.withContext(function($ctx2) {
fulfilled=true;
fulfilled;
return self._finished();
$ctx2.sendIdx["finished"]=1;
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}));
_st((function(){
return smalltalk.withContext(function($ctx2) {
self._assert_equals_(fulfilled,false);
return self._finished();
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,2)})}))._valueWithTimeout_((50));
return self}, function($ctx1) {$ctx1.fill(self,"test2222a",{p:p,fulfilled:fulfilled},smalltalk.TestPromise)})},
args: [],
source: "test2222a\x0a\x09|p fulfilled|\x0a\x09self timeout: 100.\x0a\x09p := Promise new.\x0a\x09p then: [:v| fulfilled := true. self finished].\x0a\x09[self assert: fulfilled equals: false. self finished] valueWithTimeout: 50.",
messageSends: ["timeout:", "new", "then:", "finished", "valueWithTimeout:", "assert:equals:"],
referencedClasses: ["Promise"]
}),
smalltalk.TestPromise);

smalltalk.addMethod(
smalltalk.method({
selector: "test2223a",
category: 'tests',
fn: function (){
var self=this;
var p,timesCalled;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
var $1;
timesCalled=(0);
self._timeout_((100));
_st($Promise())._new();
_st($Promise())._fulfill_((42));
$1=_st($Promise())._yourself();
p=$1;
_st(p)._then_((function(v){
return smalltalk.withContext(function($ctx2) {
timesCalled=_st(timesCalled).__plus((1));
timesCalled;
self._assert_equals_(timesCalled,(1));
return self._finished();
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}));
return self}, function($ctx1) {$ctx1.fill(self,"test2223a",{p:p,timesCalled:timesCalled},smalltalk.TestPromise)})},
args: [],
source: "test2223a\x0a\x09|p timesCalled|\x0a\x09timesCalled := 0.\x0a\x09self timeout: 100.\x0a\x09p := Promise new; fulfill: 42; yourself.\x0a\x09p then: [:v| \x0a\x09\x09timesCalled := timesCalled + 1. \x0a\x09\x09self assert: timesCalled equals: 1.\x0a\x09\x09self finished].",
messageSends: ["timeout:", "new", "fulfill:", "yourself", "then:", "+", "assert:equals:", "finished"],
referencedClasses: ["Promise"]
}),
smalltalk.TestPromise);

smalltalk.addMethod(
smalltalk.method({
selector: "test2223b",
category: 'tests',
fn: function (){
var self=this;
var p,timesCalled;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
var $1,$2;
timesCalled=(0);
self._timeout_((100));
p=_st($Promise())._new();
_st(p)._then_((function(v){
return smalltalk.withContext(function($ctx2) {
timesCalled=_st(timesCalled).__plus((1));
timesCalled;
self._assert_equals_(timesCalled,(1));
return self._finished();
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}));
$1=p;
_st($1)._fulfill_((42));
$ctx1.sendIdx["fulfill:"]=1;
$2=_st($1)._fulfill_((24));
return self}, function($ctx1) {$ctx1.fill(self,"test2223b",{p:p,timesCalled:timesCalled},smalltalk.TestPromise)})},
args: [],
source: "test2223b\x0a\x09|p timesCalled|\x0a\x09timesCalled := 0.\x0a\x09self timeout: 100.\x0a\x09p := Promise new.\x0a\x09p then: [:v| \x0a\x09\x09timesCalled := timesCalled + 1. \x0a\x09\x09self assert: timesCalled equals: 1.\x0a\x09\x09self finished].\x0a\x09p fulfill: 42; fulfill: 24.",
messageSends: ["timeout:", "new", "then:", "+", "assert:equals:", "finished", "fulfill:"],
referencedClasses: ["Promise"]
}),
smalltalk.TestPromise);

smalltalk.addMethod(
smalltalk.method({
selector: "test2223c",
category: 'tests',
fn: function (){
var self=this;
var p,timesCalled;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
var $1,$2;
timesCalled=(0);
self._timeout_((100));
p=_st($Promise())._new();
_st(p)._then_((function(v){
return smalltalk.withContext(function($ctx2) {
timesCalled=_st(timesCalled).__plus((1));
timesCalled;
self._assert_equals_(timesCalled,(1));
return self._finished();
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}));
_st((function(){
return smalltalk.withContext(function($ctx2) {
$1=p;
_st($1)._fulfill_((42));
$ctx2.sendIdx["fulfill:"]=1;
$2=_st($1)._fulfill_((24));
return $2;
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,2)})}))._valueWithTimeout_((50));
return self}, function($ctx1) {$ctx1.fill(self,"test2223c",{p:p,timesCalled:timesCalled},smalltalk.TestPromise)})},
args: [],
source: "test2223c\x0a\x09|p timesCalled|\x0a\x09timesCalled := 0.\x0a\x09self timeout: 100.\x0a\x09p := Promise new.\x0a\x09p then: [:v| \x0a\x09\x09timesCalled := timesCalled + 1. \x0a\x09\x09self assert: timesCalled equals: 1.\x0a\x09\x09self finished].\x0a\x09[p fulfill: 42; fulfill: 24] valueWithTimeout: 50.",
messageSends: ["timeout:", "new", "then:", "+", "assert:equals:", "finished", "valueWithTimeout:", "fulfill:"],
referencedClasses: ["Promise"]
}),
smalltalk.TestPromise);

smalltalk.addMethod(
smalltalk.method({
selector: "test2223d",
category: 'tests',
fn: function (){
var self=this;
var p,timesCalled;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
timesCalled=(0);
self._timeout_((100));
p=_st($Promise())._new();
_st(p)._then_((function(v){
return smalltalk.withContext(function($ctx2) {
timesCalled=_st(timesCalled).__plus((1));
timesCalled;
self._assert_equals_(timesCalled,(1));
return self._finished();
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}));
_st(p)._fulfill_((42));
$ctx1.sendIdx["fulfill:"]=1;
_st((function(){
return smalltalk.withContext(function($ctx2) {
return _st(p)._fulfill_((24));
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,2)})}))._valueWithTimeout_((50));
return self}, function($ctx1) {$ctx1.fill(self,"test2223d",{p:p,timesCalled:timesCalled},smalltalk.TestPromise)})},
args: [],
source: "test2223d\x0a\x09|p timesCalled|\x0a\x09timesCalled := 0.\x0a\x09self timeout: 100.\x0a\x09p := Promise new.\x0a\x09p then: [:v| \x0a\x09\x09timesCalled := timesCalled + 1. \x0a\x09\x09self assert: timesCalled equals: 1.\x0a\x09\x09self finished].\x0a\x09p fulfill: 42.\x0a\x09[p fulfill: 24] valueWithTimeout: 50.",
messageSends: ["timeout:", "new", "then:", "+", "assert:equals:", "finished", "fulfill:", "valueWithTimeout:"],
referencedClasses: ["Promise"]
}),
smalltalk.TestPromise);

smalltalk.addMethod(
smalltalk.method({
selector: "test2223e",
category: 'tests',
fn: function (){
var self=this;
var p,timesCalled;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
var $1,$3,$2,$4,$5,$7,$6,$8,$9,$11,$10;
timesCalled=[(0), (0), (0)];
self._timeout_((200));
p=_st($Promise())._new();
_st(p)._then_((function(v){
return smalltalk.withContext(function($ctx2) {
$1=timesCalled;
$3=_st(timesCalled)._at_((1));
$ctx2.sendIdx["at:"]=1;
$2=(1).__plus($3);
$ctx2.sendIdx["+"]=1;
_st($1)._at_put_((1),$2);
$ctx2.sendIdx["at:put:"]=1;
$4=_st(timesCalled)._at_((1));
$ctx2.sendIdx["at:"]=2;
return self._assert_equals_($4,(1));
$ctx2.sendIdx["assert:equals:"]=1;
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}));
$ctx1.sendIdx["then:"]=1;
_st((function(){
return smalltalk.withContext(function($ctx2) {
return _st(p)._then_((function(v){
return smalltalk.withContext(function($ctx3) {
$5=timesCalled;
$7=_st(timesCalled)._at_((2));
$ctx3.sendIdx["at:"]=3;
$6=(1).__plus($7);
$ctx3.sendIdx["+"]=2;
_st($5)._at_put_((2),$6);
$ctx3.sendIdx["at:put:"]=2;
$8=_st(timesCalled)._at_((2));
$ctx3.sendIdx["at:"]=4;
return self._assert_equals_($8,(1));
$ctx3.sendIdx["assert:equals:"]=2;
}, function($ctx3) {$ctx3.fillBlock({v:v},$ctx2,3)})}));
$ctx2.sendIdx["then:"]=2;
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,2)})}))._valueWithTimeout_((50));
$ctx1.sendIdx["valueWithTimeout:"]=1;
_st((function(){
return smalltalk.withContext(function($ctx2) {
return _st(p)._then_((function(v){
return smalltalk.withContext(function($ctx3) {
$9=timesCalled;
$11=_st(timesCalled)._at_((3));
$ctx3.sendIdx["at:"]=5;
$10=(1).__plus($11);
_st($9)._at_put_((3),$10);
return self._assert_equals_(_st(timesCalled)._at_((3)),(1));
}, function($ctx3) {$ctx3.fillBlock({v:v},$ctx2,5)})}));
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,4)})}))._valueWithTimeout_((100));
$ctx1.sendIdx["valueWithTimeout:"]=2;
_st((function(){
return smalltalk.withContext(function($ctx2) {
return _st(p)._fulfill_((42));
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,6)})}))._valueWithTimeout_((150));
return self}, function($ctx1) {$ctx1.fill(self,"test2223e",{p:p,timesCalled:timesCalled},smalltalk.TestPromise)})},
args: [],
source: "test2223e\x0a\x09|p timesCalled|\x0a\x09timesCalled := #(0 0 0).\x0a\x09self timeout: 200.\x0a\x09p := Promise new.\x0a\x09p then: [:v| \x0a\x09\x09timesCalled at: 1 put: 1 + (timesCalled at: 1).\x0a\x09\x09self assert: (timesCalled at: 1) equals: 1].\x0a\x09[p then: [:v| \x0a\x09\x09timesCalled at: 2 put: 1 + (timesCalled at: 2).\x0a\x09\x09self assert: (timesCalled at: 2) equals: 1]] valueWithTimeout: 50.\x0a\x09[p then: [:v| \x0a\x09\x09timesCalled at: 3 put: 1 + (timesCalled at: 3).\x0a\x09\x09self assert: (timesCalled at: 3) equals: 1]] valueWithTimeout: 100.\x0a\x09[p fulfill: 42] valueWithTimeout: 150.",
messageSends: ["timeout:", "new", "then:", "at:put:", "+", "at:", "assert:equals:", "valueWithTimeout:", "fulfill:"],
referencedClasses: ["Promise"]
}),
smalltalk.TestPromise);

smalltalk.addMethod(
smalltalk.method({
selector: "test2223f",
category: 'tests',
fn: function (){
var self=this;
var p,timesCalled;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
var $1,$3,$2,$4,$5,$7,$6;
timesCalled=[(0), (0)];
self._timeout_((100));
p=_st($Promise())._new();
_st(p)._then_((function(v){
return smalltalk.withContext(function($ctx2) {
$1=timesCalled;
$3=_st(timesCalled)._at_((1));
$ctx2.sendIdx["at:"]=1;
$2=(1).__plus($3);
$ctx2.sendIdx["+"]=1;
_st($1)._at_put_((1),$2);
$ctx2.sendIdx["at:put:"]=1;
$4=_st(timesCalled)._at_((1));
$ctx2.sendIdx["at:"]=2;
return self._assert_equals_($4,(1));
$ctx2.sendIdx["assert:equals:"]=1;
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}));
$ctx1.sendIdx["then:"]=1;
_st(p)._fulfill_((42));
_st(p)._then_((function(v){
return smalltalk.withContext(function($ctx2) {
$5=timesCalled;
$7=_st(timesCalled)._at_((2));
$ctx2.sendIdx["at:"]=3;
$6=(1).__plus($7);
_st($5)._at_put_((2),$6);
self._assert_equals_(_st(timesCalled)._at_((2)),(1));
return self._finished();
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,2)})}));
return self}, function($ctx1) {$ctx1.fill(self,"test2223f",{p:p,timesCalled:timesCalled},smalltalk.TestPromise)})},
args: [],
source: "test2223f\x0a\x09|p timesCalled|\x0a\x09timesCalled := #(0 0).\x0a\x09self timeout: 100.\x0a\x09p := Promise new.\x0a\x09p then: [:v| \x0a\x09\x09timesCalled at: 1 put: 1 + (timesCalled at: 1).\x0a\x09\x09self assert: (timesCalled at: 1) equals: 1].\x0a\x09p fulfill: 42.\x0a\x09p then: [:v| \x0a\x09\x09timesCalled at: 2 put: 1 + (timesCalled at: 2).\x0a\x09\x09self assert: (timesCalled at: 2) equals: 1.\x0a\x09\x09self finished].",
messageSends: ["timeout:", "new", "then:", "at:put:", "+", "at:", "assert:equals:", "fulfill:", "finished"],
referencedClasses: ["Promise"]
}),
smalltalk.TestPromise);

smalltalk.addMethod(
smalltalk.method({
selector: "test2231",
category: 'tests',
fn: function (){
var self=this;
var p;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
self._timeout_((100));
p=_st($Promise())._new();
_st(p)._then_else_(nil,(function(v){
return smalltalk.withContext(function($ctx2) {
_st(_st(self._assert())._v())._equals_((42));
return self._finished();
$ctx2.sendIdx["finished"]=1;
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}));
_st(p)._reject_((42));
_st((function(){
return smalltalk.withContext(function($ctx2) {
return self._finished();
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,2)})}))._valueWithTimeout_((10));
return self}, function($ctx1) {$ctx1.fill(self,"test2231",{p:p},smalltalk.TestPromise)})},
args: [],
source: "test2231\x0a\x09|p|\x0a\x09self timeout: 100.\x0a\x09p := Promise new.\x0a\x09p then: nil else: [:v| self assert v equals: 42. self finished].\x0a\x09p reject: 42.\x0a\x09[self finished] valueWithTimeout: 10",
messageSends: ["timeout:", "new", "then:else:", "equals:", "v", "assert", "finished", "reject:", "valueWithTimeout:"],
referencedClasses: ["Promise"]
}),
smalltalk.TestPromise);

smalltalk.addMethod(
smalltalk.method({
selector: "test2232a",
category: 'tests',
fn: function (){
var self=this;
var p,rejected;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
self._timeout_((100));
p=_st($Promise())._new();
_st(p)._then_else_(nil,(function(v){
return smalltalk.withContext(function($ctx2) {
self._assert_equals_(rejected,true);
return self._finished();
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}));
_st((function(){
return smalltalk.withContext(function($ctx2) {
_st(p)._reject_((42));
rejected=true;
return rejected;
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,2)})}))._valueWithTimeout_((50));
return self}, function($ctx1) {$ctx1.fill(self,"test2232a",{p:p,rejected:rejected},smalltalk.TestPromise)})},
args: [],
source: "test2232a\x0a\x09|p rejected|\x0a\x09self timeout: 100.\x0a\x09p := Promise new.\x0a\x09p then: nil else: [:v| self assert: rejected equals: true. self finished].\x0a\x09[p reject: 42. rejected := true] valueWithTimeout: 50.",
messageSends: ["timeout:", "new", "then:else:", "assert:equals:", "finished", "valueWithTimeout:", "reject:"],
referencedClasses: ["Promise"]
}),
smalltalk.TestPromise);

smalltalk.addMethod(
smalltalk.method({
selector: "test2232b",
category: 'tests',
fn: function (){
var self=this;
var p,rejected;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
self._timeout_((100));
p=_st($Promise())._new();
_st(p)._then_else_(nil,(function(v){
return smalltalk.withContext(function($ctx2) {
rejected=true;
rejected;
return self._finished();
$ctx2.sendIdx["finished"]=1;
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}));
_st((function(){
return smalltalk.withContext(function($ctx2) {
self._assert_equals_(rejected,false);
return self._finished();
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,2)})}))._valueWithTimeout_((50));
return self}, function($ctx1) {$ctx1.fill(self,"test2232b",{p:p,rejected:rejected},smalltalk.TestPromise)})},
args: [],
source: "test2232b\x0a\x09|p rejected|\x0a\x09self timeout: 100.\x0a\x09p := Promise new.\x0a\x09p then: nil else: [:v| rejected := true. self finished].\x0a\x09[self assert: rejected equals: false. self finished] valueWithTimeout: 50.",
messageSends: ["timeout:", "new", "then:else:", "finished", "valueWithTimeout:", "assert:equals:"],
referencedClasses: ["Promise"]
}),
smalltalk.TestPromise);

smalltalk.addMethod(
smalltalk.method({
selector: "test2233a",
category: 'tests',
fn: function (){
var self=this;
var p,timesCalled;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
var $1;
timesCalled=(0);
self._timeout_((100));
_st($Promise())._new();
_st($Promise())._reject_((42));
$1=_st($Promise())._yourself();
p=$1;
_st(p)._then_else_(nil,(function(v){
return smalltalk.withContext(function($ctx2) {
timesCalled=_st(timesCalled).__plus((1));
timesCalled;
self._assert_equals_(timesCalled,(1));
return self._finished();
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}));
return self}, function($ctx1) {$ctx1.fill(self,"test2233a",{p:p,timesCalled:timesCalled},smalltalk.TestPromise)})},
args: [],
source: "test2233a\x0a\x09|p timesCalled|\x0a\x09timesCalled := 0.\x0a\x09self timeout: 100.\x0a\x09p := Promise new; reject: 42; yourself.\x0a\x09p then: nil else: [:v| \x0a\x09\x09timesCalled := timesCalled + 1. \x0a\x09\x09self assert: timesCalled equals: 1.\x0a\x09\x09self finished].",
messageSends: ["timeout:", "new", "reject:", "yourself", "then:else:", "+", "assert:equals:", "finished"],
referencedClasses: ["Promise"]
}),
smalltalk.TestPromise);

smalltalk.addMethod(
smalltalk.method({
selector: "test2233b",
category: 'tests',
fn: function (){
var self=this;
var p,timesCalled;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
var $1,$2;
timesCalled=(0);
self._timeout_((100));
p=_st($Promise())._new();
_st(p)._then_else_(nil,(function(v){
return smalltalk.withContext(function($ctx2) {
timesCalled=_st(timesCalled).__plus((1));
timesCalled;
self._assert_equals_(timesCalled,(1));
return self._finished();
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}));
$1=p;
_st($1)._reject_((42));
$ctx1.sendIdx["reject:"]=1;
$2=_st($1)._reject_((24));
return self}, function($ctx1) {$ctx1.fill(self,"test2233b",{p:p,timesCalled:timesCalled},smalltalk.TestPromise)})},
args: [],
source: "test2233b\x0a\x09|p timesCalled|\x0a\x09timesCalled := 0.\x0a\x09self timeout: 100.\x0a\x09p := Promise new.\x0a\x09p then: nil else: [:v| \x0a\x09\x09timesCalled := timesCalled + 1. \x0a\x09\x09self assert: timesCalled equals: 1.\x0a\x09\x09self finished].\x0a\x09p reject: 42; reject: 24.",
messageSends: ["timeout:", "new", "then:else:", "+", "assert:equals:", "finished", "reject:"],
referencedClasses: ["Promise"]
}),
smalltalk.TestPromise);

smalltalk.addMethod(
smalltalk.method({
selector: "test2233c",
category: 'tests',
fn: function (){
var self=this;
var p,timesCalled;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
var $1,$2;
timesCalled=(0);
self._timeout_((100));
p=_st($Promise())._new();
_st(p)._then_else_(nil,(function(v){
return smalltalk.withContext(function($ctx2) {
timesCalled=_st(timesCalled).__plus((1));
timesCalled;
self._assert_equals_(timesCalled,(1));
return self._finished();
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}));
_st((function(){
return smalltalk.withContext(function($ctx2) {
$1=p;
_st($1)._reject_((42));
$ctx2.sendIdx["reject:"]=1;
$2=_st($1)._reject_((24));
return $2;
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,2)})}))._valueWithTimeout_((50));
return self}, function($ctx1) {$ctx1.fill(self,"test2233c",{p:p,timesCalled:timesCalled},smalltalk.TestPromise)})},
args: [],
source: "test2233c\x0a\x09|p timesCalled|\x0a\x09timesCalled := 0.\x0a\x09self timeout: 100.\x0a\x09p := Promise new.\x0a\x09p then: nil else: [:v| \x0a\x09\x09timesCalled := timesCalled + 1. \x0a\x09\x09self assert: timesCalled equals: 1.\x0a\x09\x09self finished].\x0a\x09[p reject: 42; reject: 24] valueWithTimeout: 50.",
messageSends: ["timeout:", "new", "then:else:", "+", "assert:equals:", "finished", "valueWithTimeout:", "reject:"],
referencedClasses: ["Promise"]
}),
smalltalk.TestPromise);

smalltalk.addMethod(
smalltalk.method({
selector: "test2233d",
category: 'tests',
fn: function (){
var self=this;
var p,timesCalled;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
timesCalled=(0);
self._timeout_((100));
p=_st($Promise())._new();
_st(p)._then_else_(nil,(function(v){
return smalltalk.withContext(function($ctx2) {
timesCalled=_st(timesCalled).__plus((1));
timesCalled;
self._assert_equals_(timesCalled,(1));
return self._finished();
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}));
_st(p)._reject_((42));
_st((function(){
return smalltalk.withContext(function($ctx2) {
return _st(p)._fulfilreject_((24));
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,2)})}))._valueWithTimeout_((50));
return self}, function($ctx1) {$ctx1.fill(self,"test2233d",{p:p,timesCalled:timesCalled},smalltalk.TestPromise)})},
args: [],
source: "test2233d\x0a\x09|p timesCalled|\x0a\x09timesCalled := 0.\x0a\x09self timeout: 100.\x0a\x09p := Promise new.\x0a\x09p then: nil else: [:v| \x0a\x09\x09timesCalled := timesCalled + 1. \x0a\x09\x09self assert: timesCalled equals: 1.\x0a\x09\x09self finished].\x0a\x09p reject: 42.\x0a\x09[p fulfilreject: 24] valueWithTimeout: 50.",
messageSends: ["timeout:", "new", "then:else:", "+", "assert:equals:", "finished", "reject:", "valueWithTimeout:", "fulfilreject:"],
referencedClasses: ["Promise"]
}),
smalltalk.TestPromise);

smalltalk.addMethod(
smalltalk.method({
selector: "test2233e",
category: 'tests',
fn: function (){
var self=this;
var p,timesCalled;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
var $1,$3,$2,$4,$5,$7,$6,$8,$9,$11,$10;
timesCalled=[(0), (0), (0)];
self._timeout_((200));
p=_st($Promise())._new();
_st(p)._then_else_(nil,(function(v){
return smalltalk.withContext(function($ctx2) {
$1=timesCalled;
$3=_st(timesCalled)._at_((1));
$ctx2.sendIdx["at:"]=1;
$2=(1).__plus($3);
$ctx2.sendIdx["+"]=1;
_st($1)._at_put_((1),$2);
$ctx2.sendIdx["at:put:"]=1;
$4=_st(timesCalled)._at_((1));
$ctx2.sendIdx["at:"]=2;
return self._assert_equals_($4,(1));
$ctx2.sendIdx["assert:equals:"]=1;
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}));
$ctx1.sendIdx["then:else:"]=1;
_st((function(){
return smalltalk.withContext(function($ctx2) {
return _st(p)._then_else_(nil,(function(v){
return smalltalk.withContext(function($ctx3) {
$5=timesCalled;
$7=_st(timesCalled)._at_((2));
$ctx3.sendIdx["at:"]=3;
$6=(1).__plus($7);
$ctx3.sendIdx["+"]=2;
_st($5)._at_put_((2),$6);
$ctx3.sendIdx["at:put:"]=2;
$8=_st(timesCalled)._at_((2));
$ctx3.sendIdx["at:"]=4;
return self._assert_equals_($8,(1));
$ctx3.sendIdx["assert:equals:"]=2;
}, function($ctx3) {$ctx3.fillBlock({v:v},$ctx2,3)})}));
$ctx2.sendIdx["then:else:"]=2;
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,2)})}))._valueWithTimeout_((50));
$ctx1.sendIdx["valueWithTimeout:"]=1;
_st((function(){
return smalltalk.withContext(function($ctx2) {
return _st(p)._then_else_(nil,(function(v){
return smalltalk.withContext(function($ctx3) {
$9=timesCalled;
$11=_st(timesCalled)._at_((3));
$ctx3.sendIdx["at:"]=5;
$10=(1).__plus($11);
_st($9)._at_put_((3),$10);
return self._assert_equals_(_st(timesCalled)._at_((3)),(1));
}, function($ctx3) {$ctx3.fillBlock({v:v},$ctx2,5)})}));
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,4)})}))._valueWithTimeout_((100));
$ctx1.sendIdx["valueWithTimeout:"]=2;
_st((function(){
return smalltalk.withContext(function($ctx2) {
return _st(p)._reject_((42));
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,6)})}))._valueWithTimeout_((150));
return self}, function($ctx1) {$ctx1.fill(self,"test2233e",{p:p,timesCalled:timesCalled},smalltalk.TestPromise)})},
args: [],
source: "test2233e\x0a\x09|p timesCalled|\x0a\x09timesCalled := #(0 0 0).\x0a\x09self timeout: 200.\x0a\x09p := Promise new.\x0a\x09p then: nil else: [:v| \x0a\x09\x09timesCalled at: 1 put: 1 + (timesCalled at: 1).\x0a\x09\x09self assert: (timesCalled at: 1) equals: 1].\x0a\x09[p then: nil else: [:v| \x0a\x09\x09timesCalled at: 2 put: 1 + (timesCalled at: 2).\x0a\x09\x09self assert: (timesCalled at: 2) equals: 1]] valueWithTimeout: 50.\x0a\x09[p then: nil else: [:v| \x0a\x09\x09timesCalled at: 3 put: 1 + (timesCalled at: 3).\x0a\x09\x09self assert: (timesCalled at: 3) equals: 1]] valueWithTimeout: 100.\x0a\x09[p reject: 42] valueWithTimeout: 150.",
messageSends: ["timeout:", "new", "then:else:", "at:put:", "+", "at:", "assert:equals:", "valueWithTimeout:", "reject:"],
referencedClasses: ["Promise"]
}),
smalltalk.TestPromise);

smalltalk.addMethod(
smalltalk.method({
selector: "test2233f",
category: 'tests',
fn: function (){
var self=this;
var p,timesCalled;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
var $1,$3,$2,$4,$5,$7,$6;
timesCalled=[(0), (0)];
self._timeout_((100));
p=_st($Promise())._new();
_st(p)._then_else_(nil,(function(v){
return smalltalk.withContext(function($ctx2) {
$1=timesCalled;
$3=_st(timesCalled)._at_((1));
$ctx2.sendIdx["at:"]=1;
$2=(1).__plus($3);
$ctx2.sendIdx["+"]=1;
_st($1)._at_put_((1),$2);
$ctx2.sendIdx["at:put:"]=1;
$4=_st(timesCalled)._at_((1));
$ctx2.sendIdx["at:"]=2;
return self._assert_equals_($4,(1));
$ctx2.sendIdx["assert:equals:"]=1;
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,1)})}));
$ctx1.sendIdx["then:else:"]=1;
_st(p)._reject_((42));
_st(p)._then_else_(nil,(function(v){
return smalltalk.withContext(function($ctx2) {
$5=timesCalled;
$7=_st(timesCalled)._at_((2));
$ctx2.sendIdx["at:"]=3;
$6=(1).__plus($7);
_st($5)._at_put_((2),$6);
self._assert_equals_(_st(timesCalled)._at_((2)),(1));
return self._finished();
}, function($ctx2) {$ctx2.fillBlock({v:v},$ctx1,2)})}));
return self}, function($ctx1) {$ctx1.fill(self,"test2233f",{p:p,timesCalled:timesCalled},smalltalk.TestPromise)})},
args: [],
source: "test2233f\x0a\x09|p timesCalled|\x0a\x09timesCalled := #(0 0).\x0a\x09self timeout: 100.\x0a\x09p := Promise new.\x0a\x09p then: nil else: [:v| \x0a\x09\x09timesCalled at: 1 put: 1 + (timesCalled at: 1).\x0a\x09\x09self assert: (timesCalled at: 1) equals: 1].\x0a\x09p reject: 42.\x0a\x09p then: nil else: [:v| \x0a\x09\x09timesCalled at: 2 put: 1 + (timesCalled at: 2).\x0a\x09\x09self assert: (timesCalled at: 2) equals: 1.\x0a\x09\x09self finished].",
messageSends: ["timeout:", "new", "then:else:", "at:put:", "+", "at:", "assert:equals:", "reject:", "finished"],
referencedClasses: ["Promise"]
}),
smalltalk.TestPromise);

smalltalk.addMethod(
smalltalk.method({
selector: "testBlockPromise",
category: 'tests',
fn: function (){
var self=this;
return smalltalk.withContext(function($ctx1) { 
self._timeout_((100));
_st(self._async_((function(){
return smalltalk.withContext(function($ctx2) {
return _st(_st((function(succ,fail){
return smalltalk.withContext(function($ctx3) {
return _st(succ)._value_((42));
}, function($ctx3) {$ctx3.fillBlock({succ:succ,fail:fail},$ctx2,2)})}))._asPromise())._then_else_((function(v){
return smalltalk.withContext(function($ctx3) {
self._assert_equals_(v,(43));
return self._finished();
}, function($ctx3) {$ctx3.fillBlock({v:v},$ctx2,3)})}),(function(e){
return smalltalk.withContext(function($ctx3) {
return self._signalFailure_("Simple Block promise failed!");
}, function($ctx3) {$ctx3.fillBlock({e:e},$ctx2,4)})}));
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,1)})})))._valueWithTimeout_((0));
return self}, function($ctx1) {$ctx1.fill(self,"testBlockPromise",{},smalltalk.TestPromise)})},
args: [],
source: "testBlockPromise\x0a\x09\x22\x22\x0a\x09self timeout: 100.\x0a\x09(self async: [\x0a\x09\x09[:succ :fail| succ value: 42] asPromise\x0a\x09\x09\x09then: [:v| self assert: v equals: 43. self finished.]\x0a\x09\x09\x09else: [:e| self signalFailure: 'Simple Block promise failed!']])\x0a\x09\x09valueWithTimeout: 0.\x0a\x09",
messageSends: ["timeout:", "valueWithTimeout:", "async:", "then:else:", "asPromise", "value:", "assert:equals:", "finished", "signalFailure:"],
referencedClasses: []
}),
smalltalk.TestPromise);

smalltalk.addMethod(
smalltalk.method({
selector: "testComputation",
category: 'tests',
fn: function (){
var self=this;
var p1,p2,psum;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
self._timeout_((200));
p1=_st($Promise())._new();
$ctx1.sendIdx["new"]=1;
p2=_st($Promise())._new();
psum=_st(p1).__plus(p2);
_st(self._async_((function(){
return smalltalk.withContext(function($ctx2) {
return _st(psum)._then_((function(v){
return smalltalk.withContext(function($ctx3) {
self._assert_equals_(v,(66));
return self._finished();
}, function($ctx3) {$ctx3.fillBlock({v:v},$ctx2,2)})}));
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,1)})})))._valueWithTimeout_((150));
$ctx1.sendIdx["valueWithTimeout:"]=1;
_st((function(){
return smalltalk.withContext(function($ctx2) {
return _st(p1)._fulfill_((43));
$ctx2.sendIdx["fulfill:"]=1;
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,3)})}))._valueWithTimeout_((50));
$ctx1.sendIdx["valueWithTimeout:"]=2;
_st((function(){
return smalltalk.withContext(function($ctx2) {
return _st(p2)._fulfill_((24));
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,4)})}))._valueWithTimeout_((100));
return self}, function($ctx1) {$ctx1.fill(self,"testComputation",{p1:p1,p2:p2,psum:psum},smalltalk.TestPromise)})},
args: [],
source: "testComputation\x0a\x09|p1 p2 psum|\x0a\x09self timeout: 200.\x0a\x09p1 := Promise new.\x0a\x09p2 := Promise new.\x0a\x09psum := p1 + p2.\x0a\x09(self async: [psum then: [:v| self assert: v equals: 66. self finished.]]) valueWithTimeout: 150.\x0a\x09[p1 fulfill: 43] valueWithTimeout: 50.\x0a\x09[p2 fulfill: 24] valueWithTimeout: 100.",
messageSends: ["timeout:", "new", "+", "valueWithTimeout:", "async:", "then:", "assert:equals:", "finished", "fulfill:"],
referencedClasses: ["Promise"]
}),
smalltalk.TestPromise);

smalltalk.addMethod(
smalltalk.method({
selector: "testSequence",
category: 'tests',
fn: function (){
var self=this;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
var $1,$2;
self._timeout_((100));
_st(self._async_((function(){
var p,dbl;
return smalltalk.withContext(function($ctx2) {
p=_st($Promise())._new();
p;
dbl=(function(y){
return smalltalk.withContext(function($ctx3) {
return _st(y).__star((2));
$ctx3.sendIdx["*"]=1;
}, function($ctx3) {$ctx3.fillBlock({y:y},$ctx2,2)})});
dbl;
$1=_st(p)._begin();
_st($1)._then_(dbl);
$ctx2.sendIdx["then:"]=1;
_st($1)._then_(dbl);
$ctx2.sendIdx["then:"]=2;
_st($1)._then_(dbl);
$ctx2.sendIdx["then:"]=3;
$2=_st($1)._then_((function(y){
return smalltalk.withContext(function($ctx3) {
self._assert_equals_(y,(42).__star((8)));
return self._finished();
}, function($ctx3) {$ctx3.fillBlock({y:y},$ctx2,3)})}));
$2;
return _st(p)._fulfill_((42));
}, function($ctx2) {$ctx2.fillBlock({p:p,dbl:dbl},$ctx1,1)})})))._valueWithTimeout_((10));
return self}, function($ctx1) {$ctx1.fill(self,"testSequence",{},smalltalk.TestPromise)})},
args: [],
source: "testSequence\x0a\x09\x22\x22\x0a\x09self timeout: 100.\x0a\x09(self async: [|p dbl|\x0a\x09\x09p := Promise new.\x0a\x09\x09dbl := [:y| y * 2].\x0a\x09\x09p begin \x0a\x09\x09\x09then: dbl; then: dbl; then: dbl;\x0a\x09\x09  \x09then: [:y| self assert: y equals: 42 * 8. self finished].\x0a\x09\x09p fulfill: 42.\x0a\x09]) valueWithTimeout: 10.",
messageSends: ["timeout:", "valueWithTimeout:", "async:", "new", "*", "then:", "begin", "assert:equals:", "finished", "fulfill:"],
referencedClasses: ["Promise"]
}),
smalltalk.TestPromise);


smalltalk.addMethod(
smalltalk.method({
selector: "asPromise",
category: '*Promise',
fn: function (){
var self=this;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
var $2,$3,$1;
$2=_st($Promise())._new();
_st($2)._fulfill_(self);
$3=_st($2)._yourself();
$1=$3;
return $1;
}, function($ctx1) {$ctx1.fill(self,"asPromise",{},smalltalk.Object)})},
args: [],
source: "asPromise\x0a\x09^Promise new fulfill: self; yourself.",
messageSends: ["fulfill:", "new", "yourself"],
referencedClasses: ["Promise"]
}),
smalltalk.Object);

smalltalk.addMethod(
smalltalk.method({
selector: "asPromise",
category: '*Promise',
fn: function (){
var self=this;
var p,nargs;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
var $1;
p=_st($Promise())._new();
_st((function(){
return smalltalk.withContext(function($ctx2) {
return self._value_value_(_st(p)._callback(),_st(p)._errback());
}, function($ctx2) {$ctx2.fillBlock({},$ctx1,1)})}))._fork();
$1=p;
return $1;
}, function($ctx1) {$ctx1.fill(self,"asPromise",{p:p,nargs:nargs},smalltalk.BlockClosure)})},
args: [],
source: "asPromise\x0a\x09\x22Turns a block that takes two arguments - the callback and errback - \x0a\x09into a promise, whereby calling the callback will fulfill the promise\x0a\x09and the errback will reject the promise.\x22\x0a\x09|p nargs|\x0a\x09p := Promise new.\x0a\x09[self value: p callback value: p errback] fork.\x0a\x09^p.",
messageSends: ["new", "fork", "value:value:", "callback", "errback"],
referencedClasses: ["Promise"]
}),
smalltalk.BlockClosure);

smalltalk.addMethod(
smalltalk.method({
selector: "asPromise",
category: '*Promise',
fn: function (){
var self=this;
var p,count,processed,step;
function $Promise(){return smalltalk.Promise||(typeof Promise=="undefined"?nil:Promise)}
return smalltalk.withContext(function($ctx1) { 
var $1,$2,$3;
processed=(0);
count=self._size();
p=_st($Promise())._new();
step=(function(y){
return smalltalk.withContext(function($ctx2) {
processed=_st(processed).__plus((1));
processed;
$1=_st(processed).__eq(count);
if(smalltalk.assert($1)){
return _st(p)._fulfill_(y);
};
}, function($ctx2) {$ctx2.fillBlock({y:y},$ctx1,1)})});
self._withIndexDo_((function(arg,ix){
return smalltalk.withContext(function($ctx2) {
$2=_st(arg)._isKindOf_($Promise());
if(smalltalk.assert($2)){
return _st(arg)._then_else_((function(y){
return smalltalk.withContext(function($ctx3) {
self._at_put_(ix,y);
return _st(step)._value_(self);
$ctx3.sendIdx["value:"]=1;
}, function($ctx3) {$ctx3.fillBlock({y:y},$ctx2,5)})}),_st(p)._errback());
} else {
return _st(step)._value_(self);
};
}, function($ctx2) {$ctx2.fillBlock({arg:arg,ix:ix},$ctx1,3)})}));
$3=p;
return $3;
}, function($ctx1) {$ctx1.fill(self,"asPromise",{p:p,count:count,processed:processed,step:step},smalltalk.IndexableCollection)})},
args: [],
source: "asPromise\x0a\x09\x22Produces a Promise that promises the IndexableCollection \x0a\x09to be delivered with all members that are Promise instances\x0a\x09resolved to their values.\x22\x0a\x09\x0a\x09|p count processed step|\x0a\x09processed := 0.\x0a\x09count := self size.\x0a\x09p := Promise new.\x0a\x09step := [:y|\x0a\x09\x09processed := processed + 1.\x0a\x09\x09processed = count ifTrue: [p fulfill: y]].\x0a\x09\x0a\x09self withIndexDo: [:arg :ix|\x0a\x09\x09(arg isKindOf: Promise)\x0a\x09\x09\x09ifTrue: [\x0a\x09\x09\x09\x09arg then: [:y| self at: ix put: y. step value: self]\x0a\x09\x09\x09\x09\x09else: p errback]\x0a\x09\x09\x09ifFalse: [step value: self]].\x0a\x09\x09\x09\x0a\x09^p.",
messageSends: ["size", "new", "+", "ifTrue:", "=", "fulfill:", "withIndexDo:", "ifTrue:ifFalse:", "isKindOf:", "then:else:", "at:put:", "value:", "errback"],
referencedClasses: ["Promise"]
}),
smalltalk.IndexableCollection);

});
