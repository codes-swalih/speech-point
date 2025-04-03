"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleProviderSignIn = async (provider: string) => {
    setIsLoading(true);
    try {
      const result = await signIn(provider, { callbackUrl: "/app" });
      if (result?.error) {
        console.error("Authentication error:", result.error);
      }
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="relative w-20 h-20">
                  <Image 
                    src="/logo.png" 
                    alt="SpeechPoint Logo" 
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to SpeechPoint</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Sign in to convert your speech into professional documentation
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => handleProviderSignIn("google")}
                disabled={isLoading}
                className="flex items-center justify-center w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <FaGoogle className="w-5 h-5 mr-2 text-red-500" />
                <span>Continue with Google</span>
              </button>
              
              <button
                onClick={() => handleProviderSignIn("github")}
                disabled={isLoading}
                className="flex items-center justify-center w-full px-4 py-3 text-white bg-gray-800 border border-transparent rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                <FaGithub className="w-5 h-5 mr-2" />
                <span>Continue with GitHub</span>
              </button>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
          
          <div className="px-8 py-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p>Need help? <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">Contact support</a></p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            <div className="w-2 h-2 rounded-full bg-pink-500"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          </div>
          <p className="mt-4 text-sm text-gray-400">
            © {new Date().getFullYear()} SpeechPoint. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}