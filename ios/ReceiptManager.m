#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(ReceiptManager, NSObject)

RCT_EXTERN_METHOD(getAppReceiptData:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
