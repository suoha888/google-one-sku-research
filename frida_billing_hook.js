// Ultra0 注入脚本：多商品查询 → 自动挑最长免费试用 → 主线程拉起收银台
var dexLoader=null, ctxRef=null, clientRef=null;
var PRODUCTS=["g1.play.20tb","g1.play.ai.pro","g1.30tb"];   // 5x / 20x(带试用) / 20x(另一档)
var PREFER="";        // 空=自动挑最长；可传 "eft-12month" 等
function L(v){ Java.classFactory.loader=v; }
function S(o){ send(o); }

function periodRank(p){
  var m={"P1Y":12,"P12M":12,"P6M":6,"P26W2D":6,"P3M":3,"P13W1D":3,"P1M":1,"P4W3D":1};
  return m[String(p)]||0;
}
function getActivity(){
  L(null);
  var found=null;
  try{
    var Activity=Java.use("android.app.Activity");
    var AT=Java.use("android.app.ActivityThread");
    var acts=AT.currentActivityThread().mActivities.value;
    var it=acts.values().iterator();
    while(it.hasNext()){
      var rec=it.next();
      var f=rec.getClass().getDeclaredField("activity");
      f.setAccessible(true);
      var a=Java.cast(f.get(rec), Activity);
      if(a && !a.isFinishing() && !a.isDestroyed()){ found=a; break; }
    }
  }catch(e){}
  if(found) return found;
  try{
    Java.choose("android.app.Activity", {
      onMatch:function(a){ try{ if(!found && !a.isFinishing()) found=a; }catch(e){} },
      onComplete:function(){}
    });
  }catch(e){ S({ev:"choose_err", m:String(e).slice(0,80)}); }
  return found;
}
function boot(){
 Java.perform(function(){
  try{
   L(null);
   ctxRef=Java.use("android.app.ActivityThread").currentApplication().getApplicationContext();
   var DexClassLoader=Java.use("dalvik.system.DexClassLoader");
   dexLoader=DexClassLoader.$new("/data/local/tmp/module_521.apk",
      ctxRef.getCodeCacheDir().getAbsolutePath(), null, ctxRef.getClassLoader());
   L(dexLoader);
   var BillingClient=Java.use("com.android.billingclient.api.BillingClient");
   var PUL=Java.use("com.android.billingclient.api.PurchasesUpdatedListener");
   var Lst=Java.registerClass({name:"rc.A"+Date.now(), implements:[PUL], methods:{
     onPurchasesUpdated:function(r,p){ S({ev:"purchase_cb", code:r.getResponseCode(), msg:String(r.getDebugMessage()||"")}); }}});
   var b=BillingClient.newBuilder(ctxRef);
   b.setListener(Lst.$new());
   try{ b.enablePendingPurchases(); }catch(e){}
   clientRef=b.build();
   var SLL=Java.use("com.android.billingclient.api.BillingClientStateListener");
   var SL=Java.registerClass({name:"rc.B"+Date.now(), implements:[SLL], methods:{
     onBillingSetupFinished:function(r){ S({ev:"setup", code:r.getResponseCode()});
        if(r.getResponseCode()===0) query(); },
     onBillingServiceDisconnected:function(){ S({ev:"disc"}); }}});
   clientRef.startConnection(SL.$new());
   S({ev:"connecting", products:PRODUCTS});
  }catch(e){ S({ev:"boot_err", m:String(e).slice(0,200)}); }
 });
}
function query(){
 try{
  L(dexLoader);
  var Prod=Java.use("com.android.billingclient.api.QueryProductDetailsParams$Product");
  var Params=Java.use("com.android.billingclient.api.QueryProductDetailsParams");
  var PDL=Java.use("com.android.billingclient.api.ProductDetailsResponseListener");
  var PL=Java.registerClass({name:"rc.C"+Date.now(), implements:[PDL], methods:{
    onProductDetailsResponse:function(res,list){
      S({ev:"pd", code:res.getResponseCode(), n:(list?list.size():0)});
      if(res.getResponseCode()!==0 || !list || list.size()===0) return;
      L(dexLoader);
      var PD=Java.use("com.android.billingclient.api.ProductDetails");
      var SOD=Java.use("com.android.billingclient.api.ProductDetails$SubscriptionOfferDetails");
      var PP=Java.use("com.android.billingclient.api.ProductDetails$PricingPhase");
      var best=null;
      for(var i=0;i<list.size();i++){
        var pd=Java.cast(list.get(i), PD);
        var pid=String(pd.getProductId());
        var offs=pd.getSubscriptionOfferDetails();
        if(!offs){ S({ev:"no_offers", product:pid}); continue; }
        for(var j=0;j<offs.size();j++){
          var o=Java.cast(offs.get(j), SOD);
          var oid=String(o.getOfferId());
          var tok=String(o.getOfferToken());
          var ph=o.getPricingPhases().getPricingPhaseList();
          var first=Java.cast(ph.get(0), PP);
          var micros=String(first.getPriceAmountMicros());
          var period=String(first.getBillingPeriod());
          S({ev:"offer", product:pid, id:oid, micros:micros, period:period, token:tok, title:String(pd.getTitle()), name:String(pd.getName())});
          var __force = (typeof FORCE_TOKEN !== "undefined" && FORCE_TOKEN);
          var __paid = (typeof ALLOW_PAID !== "undefined" && ALLOW_PAID);
          if(micros!=="0" && !__force && !__paid) continue;
          if(__paid && !__force){
            // 付费促销模式：选首期价格最低的 offer（如 introprice 24.99）
            var price=parseInt(micros,10)||0;
            if(!best || price < best.price){
              best={pd:pd, offer:o, product:pid, id:oid, rank:periodRank(period), period:period, token:tok, price:price};
            }
            continue;
          }
          var rank=periodRank(period);
          var matchPrefer = (!PREFER || oid===PREFER || oid.indexOf(PREFER)===0);
          if(!best || rank>best.rank || (PREFER && matchPrefer)){
            if(PREFER && !matchPrefer) continue;
            best={pd:pd, offer:o, product:pid, id:oid, rank:rank, period:period, token:tok};
          }
        }
      }
      if(!best){ S({ev:"no_trial"}); return; }
      S({ev:"chosen", product:best.product, id:best.id, period:best.period});
      if (typeof LIST_ONLY !== "undefined" && LIST_ONLY) {
        S({ev:"list_only", product:best.product, id:best.id, period:best.period, token:best.token});
        return;
      }
      if (typeof OLD_TOKEN !== "undefined" && OLD_TOKEN) {
        S({ev:"stack_start", product:best.product, id:best.id, src:"provided_token"});
        launch(best.pd, best.offer, OLD_TOKEN);
      } else if (typeof STACK !== "undefined" && STACK) {
        S({ev:"stack_start", product:best.product, id:best.id, src:"query"});
        launchWithStack(best.pd, best.offer);
      } else {
        launch(best.pd, best.offer);
      }
    }}});
  var arr=Java.use("java.util.ArrayList").$new();
  for(var k=0;k<PRODUCTS.length;k++){
    arr.add(Prod.newBuilder().setProductId(PRODUCTS[k]).setProductType("subs").build());
  }
  L(dexLoader);
  clientRef.queryProductDetailsAsync(Params.newBuilder().setProductList(arr).build(), PL.$new());
  S({ev:"query_sent"});
 }catch(e){ S({ev:"query_err", m:String(e).slice(0,200)}); }
}
function launchWithStack(pd, offer){
 try{
  L(dexLoader);
  var QP=Java.use("com.android.billingclient.api.QueryPurchasesParams");
  var PRL=Java.use("com.android.billingclient.api.PurchasesResponseListener");
  var cls=Java.registerClass({name:"rc.P"+Date.now(), implements:[PRL], methods:{
    onQueryPurchasesResponse:function(br, purchases){
      try{
        var list=Java.cast(purchases, Java.use("java.util.List"));
        S({ev:"purchases", n:list.size(), code:String(br.getResponseCode())});
        if(list.size()===0){ S({ev:"no_purchase"}); launch(pd, offer); return; }
        var pu=Java.cast(list.get(0), Java.use("com.android.billingclient.api.Purchase"));
        var tok=String(pu.getPurchaseToken());
        S({ev:"old_purchase", head:tok.slice(0,16), products:String(pu.getProducts())});
        launch(pd, offer, tok);
      }catch(e){ S({ev:"stack_query_err", m:String(e).slice(0,200)}); launch(pd, offer); }
    }}});
  var qp=QP.newBuilder().setProductType("subs").build();
  clientRef.queryPurchasesAsync(qp, cls.$new());
 }catch(e){ S({ev:"stack_outer_err", m:String(e).slice(0,200)}); launch(pd, offer); }
}

function launch(pd, offer, oldTok){
 try{
  L(dexLoader);
  var PDP=Java.use("com.android.billingclient.api.BillingFlowParams$ProductDetailsParams");
  var BFP=Java.use("com.android.billingclient.api.BillingFlowParams");
  var __ot = (typeof FORCE_TOKEN !== "undefined" && FORCE_TOKEN) ? FORCE_TOKEN : String(offer.getOfferToken());
  S({ev:"offer_token_used", forced: !!(typeof FORCE_TOKEN !== "undefined" && FORCE_TOKEN), head:String(__ot).slice(0,20)});
  var pdp=PDP.newBuilder().setProductDetails(pd).setOfferToken(String(__ot)).build();
  var l=Java.use("java.util.ArrayList").$new(); l.add(pdp);
  var b=BFP.newBuilder().setProductDetailsParamsList(l);
  if(oldTok){
    // 订阅升级：旧 purchaseToken + CHARGE_FULL_PRICE(5)
    // 这样 Play 会把「剩余试用期折算」后顺延，而不是"换成同档、日期不变"
    try{
      var SUP=Java.use("com.android.billingclient.api.BillingFlowParams$SubscriptionUpdateParams");
      var md = (typeof STACK_MODE !== "undefined" && STACK_MODE) ? STACK_MODE : 5;
      var sb=SUP.newBuilder();
      // 这个 Billing 版本用 setReplaceProrationMode（旧名 setReplaceSkusProrationMode）
      var mode_set=false;
      try{ sb=sb.setReplaceProrationMode(md); mode_set=true; }
      catch(e1){
        try{ sb=sb.setReplaceSkusProrationMode(md); mode_set=true; }
        catch(e2){ S({ev:"mode_err", m:String(e2).slice(0,120)}); }
      }
      S({ev:"mode_applied", mode:md, ok:mode_set});
      var sup=sb.setOldPurchaseToken(String(oldTok)).build();
      b=b.setSubscriptionUpdateParams(sup);
      S({ev:"stack_mode", mode:md, old: String(oldTok).slice(0,16)});
    }catch(e){ S({ev:"stack_param_err", m:String(e).slice(0,160)}); }
  }
  var params=b.build();
  var act=getActivity();
  S({ev:"activity", a: act? String(act.getClass().getName()) : "null"});
  if(!act){ S({ev:"no_activity"}); return; }
  L(null);
  var Handler=Java.use("android.os.Handler"); var Looper=Java.use("android.os.Looper");
  var R=Java.registerClass({name:"rc.R"+Date.now(), implements:[Java.use("java.lang.Runnable")], methods:{
    run:function(){
      try{
        L(dexLoader);
        var Activity=Java.use("android.app.Activity");
        var r2=clientRef.launchBillingFlow(Java.cast(act, Activity), params);
        S({ev:"launched", code:r2.getResponseCode(), msg:String(r2.getDebugMessage()||"")});
      }catch(e){ S({ev:"launch_err", m:String(e).slice(0,200)}); }
    }}});
  Handler.$new(Looper.getMainLooper()).post(R.$new());
 }catch(e){ S({ev:"launch_outer_err", m:String(e).slice(0,200)}); }
}
var __tries=0;
var iv=setInterval(function(){
  try{
    L(null);
    var a=Java.use("android.app.ActivityThread").currentApplication();
    __tries++;
    if(a || __tries>10){ clearInterval(iv); S({ev:"boot_start", app:!!a, tries:__tries}); boot(); }
  }catch(e){
    __tries++;
    if(__tries>10){ clearInterval(iv); S({ev:"boot_force", m:String(e).slice(0,120)}); try{ boot(); }catch(e2){ S({ev:"boot_fail", m:String(e2).slice(0,160)}); } }
  }
},400);
