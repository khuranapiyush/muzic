import UIKit
import FBSDKCoreKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?
    
    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        // Use this method to optionally configure and attach the UIWindow `window` to the provided UIWindowScene `scene`.
        guard let windowScene = (scene as? UIWindowScene) else { return }
        
        if let urlContext = connectionOptions.urlContexts.first {
            FBSDKCoreKit.ApplicationDelegate.shared.application(
                UIApplication.shared,
                open: urlContext.url,
                sourceApplication: urlContext.options.sourceApplication,
                annotation: nil
            )
        }
    }
    
    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        guard let url = URLContexts.first?.url else {
            return
        }

        FBSDKCoreKit.ApplicationDelegate.shared.application(
            UIApplication.shared,
            open: url,
            sourceApplication: URLContexts.first?.options.sourceApplication,
            annotation: nil
        )
    }
} 