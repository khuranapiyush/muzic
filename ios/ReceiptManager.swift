import Foundation
import React

@objc(ReceiptManager)
class ReceiptManager: NSObject {
  
  @objc
  func getAppReceiptData(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    
    guard let appStoreReceiptURL = Bundle.main.appStoreReceiptURL else {
      reject("NO_RECEIPT_URL", "App Store receipt URL not found", nil)
      return
    }
    
    guard FileManager.default.fileExists(atPath: appStoreReceiptURL.path) else {
      reject("NO_RECEIPT_FILE", "Receipt file does not exist", nil)
      return
    }
    
    do {
      let receiptData = try Data(contentsOf: appStoreReceiptURL)
      let receiptBase64 = receiptData.base64EncodedString()
      
      // Log first 40 characters for debugging (as suggested in your requirements)
      let preview = String(receiptBase64.prefix(40))
      print("📧 App Receipt Preview (first 40 chars): \(preview)")
      print("📧 App Receipt Length: \(receiptBase64.count) characters")
      
      // Check if this looks like proper base64 (should NOT start with "eyJ")
      if receiptBase64.hasPrefix("eyJ") {
        print("⚠️ WARNING: Receipt appears to be JSON, not base64 receipt!")
      }
      
      resolve(receiptBase64)
      
    } catch {
      reject("RECEIPT_READ_ERROR", "Failed to read receipt data: \(error.localizedDescription)", error)
    }
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
