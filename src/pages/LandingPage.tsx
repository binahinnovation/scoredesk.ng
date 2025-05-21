
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50">
      <header className="container mx-auto flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-2xl text-emerald-700">ScoreDesk</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/login")}>Login</Button>
          <Button className="bg-emerald-700 hover:bg-emerald-800" onClick={() => navigate("/signup")}>Sign Up</Button>
        </div>
      </header>
      
      <main>
        {/* Hero Section */}
        <section className="container mx-auto py-12 md:py-24 px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
              Nigerian School Result Management Made Simple
            </h1>
            <p className="text-lg text-gray-600">
              A beautiful, customizable, and easy-to-use result management system for Nigerian nursery, primary, and secondary schools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-emerald-700 hover:bg-emerald-800 px-8 py-6 text-lg" 
                onClick={() => navigate("/signup")}
              >
                Get Started
              </Button>
              <Button variant="outline" className="px-8 py-6 text-lg">
                Book a Demo
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 bg-white p-6 rounded-lg shadow-lg">
            <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
              <p className="text-gray-500">Result Card Preview</p>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose ScoreDesk?</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-emerald-50 p-6 rounded-lg">
                <h3 className="font-bold text-xl mb-3">Multi-School Support</h3>
                <p>Each school gets their unique environment with custom logos, term settings, and user management.</p>
              </div>
              
              <div className="bg-emerald-50 p-6 rounded-lg">
                <h3 className="font-bold text-xl mb-3">Role-Based Access</h3>
                <p>Different user roles with appropriate permissions for principals, teachers, and administrators.</p>
              </div>
              
              <div className="bg-emerald-50 p-6 rounded-lg">
                <h3 className="font-bold text-xl mb-3">Nigerian-Style Grading</h3>
                <p>Auto-calculate class positions with tied ranking support and customizable grading systems.</p>
              </div>
              
              <div className="bg-emerald-50 p-6 rounded-lg">
                <h3 className="font-bold text-xl mb-3">Customizable Templates</h3>
                <p>Choose from pre-designed report card templates or create your own with our drag-and-drop builder.</p>
              </div>
              
              <div className="bg-emerald-50 p-6 rounded-lg">
                <h3 className="font-bold text-xl mb-3">Student Result Portal</h3>
                <p>Generate scratch cards for students and parents to access results securely.</p>
              </div>
              
              <div className="bg-emerald-50 p-6 rounded-lg">
                <h3 className="font-bold text-xl mb-3">Analytics Dashboard</h3>
                <p>Track subject performance, class averages, and identify areas for improvement.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="bg-emerald-700 py-16 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to transform your school's result management?</h2>
            <p className="mb-8 max-w-2xl mx-auto">Join hundreds of Nigerian schools already using ScoreDesk to streamline their result processing and improve academic outcomes.</p>
            <Button 
              className="bg-white text-emerald-700 hover:bg-gray-100 px-8 py-6 text-lg" 
              onClick={() => navigate("/signup")}
            >
              Start Your Free Trial
            </Button>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <h3 className="text-xl font-bold mb-4">ScoreDesk</h3>
              <p className="max-w-xs">The ultimate result management system for Nigerian schools.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-4">Product</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-emerald-300">Features</a></li>
                  <li><a href="#" className="hover:text-emerald-300">Pricing</a></li>
                  <li><a href="#" className="hover:text-emerald-300">Demo</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-emerald-300">Documentation</a></li>
                  <li><a href="#" className="hover:text-emerald-300">Tutorials</a></li>
                  <li><a href="#" className="hover:text-emerald-300">Blog</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Contact</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-emerald-300">Support</a></li>
                  <li><a href="#" className="hover:text-emerald-300">Sales</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p>&copy; 2025 ScoreDesk. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-emerald-300">Privacy Policy</a>
              <a href="#" className="hover:text-emerald-300">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
