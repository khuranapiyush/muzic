# StoreKit Testing Configuration Guide

This guide explains how to properly set up and enable StoreKit testing in Xcode for local in-app purchase testing.

## Prerequisites

- Xcode 12 or higher
- iOS 14.0+ simulator or device
- The iOS app project loaded in Xcode

## Step 1: Ensure StoreKit Configuration File Exists

A StoreKit configuration file (`IAPProducts.storekit`) should already exist in your project. This file defines the products available for testing.

## Step 2: Configure Xcode Scheme for StoreKit Testing

1. Open your project in Xcode
2. Go to `Product > Scheme > Edit Scheme...` (or press `⌘<`)
3. In the scheme editor, select the `Run` action from the left sidebar
4. Select the `Options` tab
5. Find the `StoreKit Configuration` dropdown and select `IAPProducts.storekit`
6. Make sure the `Enable StoreKit Testing` checkbox is checked
7. Click `Close` to save the changes

![Xcode Scheme Configuration](https://docs-assets.developer.apple.com/published/8f163aad25f3968abd12eaf8b4a114ab/2650-add-storekit-configuration@2x.png)

## Step 3: Run the App in Simulator

1. Select an iOS 14.0+ simulator
2. Build and run the app
3. Navigate to the subscription screen

## Troubleshooting

If products don't appear:

1. Check console logs for specific error messages
2. Verify that the product IDs in your code match exactly with those in the StoreKit configuration file
3. Make sure StoreKit testing is enabled in the scheme
4. Try stopping and restarting the app
5. Check that you're using iOS 14.0+ simulator

## Testing Purchases

When StoreKit testing is enabled, any purchase attempts will show a StoreKit testing interface rather than an actual App Store prompt. You can approve or decline purchases without any real charges.

## Additional Resources

- [Apple Documentation: Testing In-App Purchases](https://developer.apple.com/documentation/storekit/in-app_purchase/testing_in-app_purchases_in_your_app)
- [WWDC 2020: StoreKit Testing in Xcode](https://developer.apple.com/videos/play/wwdc2020/10659/) 