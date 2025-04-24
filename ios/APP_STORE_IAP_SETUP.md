# App Store In-App Purchase Setup Guide

This guide will help you set up in-app purchases for your app on Apple's App Store Connect.

## Prerequisites

1. An Apple Developer account
2. Access to App Store Connect
3. A valid app on App Store Connect

## Step 1: Configure your app

1. Open your Xcode project
2. Select your app target
3. Go to "Signing & Capabilities"
4. Add the "In-App Purchase" capability if not already present

## Step 2: Set up products in App Store Connect

1. Sign in to [App Store Connect](https://appstoreconnect.apple.com/)
2. Select your app from "My Apps"
3. Go to "Features" tab
4. Select "In-App Purchases"
5. Click "+" to add a new in-app purchase
6. Choose the appropriate type:
   - Consumable
   - Non-Consumable
   - Auto-Renewable Subscription
   - Non-Renewing Subscription

## Step 3: Configure each product

For each product, you'll need to provide:

1. **Reference Name**: A name for internal use only
2. **Product ID**: Must match the ID used in your code (e.g., `payment_100`)
3. **Price**: Select a price tier
4. **Display Name**: The name visible to users
5. **Description**: Details about the product
6. **Screenshot for Review**: Required image (1920x1080px)

Ensure all fields are complete before proceeding.

## Step 4: Set product status

1. Complete all required fields
2. Set the status to "Ready to Submit"
3. For your first submission, the product status will remain as "Waiting for Review" until your app is approved

## Step 5: Testing with Sandbox

1. Go to "Users and Access" in App Store Connect
2. Select "Sandbox" tab
3. Click "+" to create a Sandbox tester account
4. Fill in the required details (use an email that's not already an Apple ID)
5. Go to your iOS device's Settings
6. Sign out of your Apple ID
7. Launch your app and attempt a purchase
8. Sign in with your Sandbox tester account when prompted

## Step 6: Implement receipt validation

For secure validation, implement server-side receipt verification:

1. When a purchase completes, send the receipt to your server
2. Have your server validate with Apple's verification service:
   - Production: `https://buy.itunes.apple.com/verifyReceipt`
   - Sandbox: `https://sandbox.itunes.apple.com/verifyReceipt`
3. Process the response and grant the purchased content

## Important Notes

- First-time IAPs must be submitted with a new app version
- Sandbox testing does not require app approval
- Receipt validation should include proper error handling
- Be prepared for purchase states: deferred, cancelled, failed, purchased, restored
- Follow [Apple's In-App Purchase Guidelines](https://developer.apple.com/app-store/review/guidelines/#in-app-purchase)

## Troubleshooting

- If purchases don't appear, verify they are "Ready to Submit" in App Store Connect
- For "Cannot connect to iTunes Store" errors, ensure your device has network connectivity
- For "Sandbox account not found" errors, create a new Sandbox tester
- If using Xcode's StoreKit testing, remove or disable that for App Store testing

## App Store Review Tips

- Make sure your IAPs work properly before submission
- Include clear instructions for testers
- Provide demo accounts if needed
- Explain any unusual purchase flows in App Review notes 