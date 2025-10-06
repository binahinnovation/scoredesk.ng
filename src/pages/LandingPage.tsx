import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { BarChart3, BookOpen, GraduationCap, LineChart, Settings, Shield, Trophy, Users } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-roboto bg-gradient-to-b from-white to-emerald-50">
      {/* Enhanced Header */}
      <header className="container mx-auto flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <div className="bg-emerald-700 text-white p-2 rounded-lg">
            <BookOpen className="h-6 w-6" />
          </div>
          <span className="font-bold text-2xl text-emerald-700">ScoreDesk</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="hover-scale" onClick={() => navigate("/login")}>Login</Button>
          <Button className="bg-emerald-700 hover:bg-emerald-800 shadow-lg hover-scale" onClick={() => navigate("/signup")}>
            Sign Up
          </Button>
        </div>
      </header>
      
      <main>
        {/* Hero Section with Animation */}
        <section className="container mx-auto py-16 md:py-24 px-6 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
              Nigerian School Result Management <span className="text-emerald-700">Made Simple</span>
            </h1>
            <p className="text-lg text-gray-600">
              A beautiful, customizable, and easy-to-use result management system for Nigerian nursery, primary, and secondary schools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                className="bg-emerald-700 hover:bg-emerald-800 px-8 py-6 text-lg shadow-lg hover-scale btn-hover-effect" 
                onClick={() => navigate("/signup")}
              >
                Get Started
              </Button>
              <Button variant="outline" className="px-8 py-6 text-lg border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover-scale">
                Book a Demo
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 bg-white p-6 rounded-xl shadow-xl animate-slide-in">
            <div className="aspect-video bg-gradient-light rounded-lg flex flex-col items-center justify-center p-8">
              <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-4">
                <div className="flex justify-between items-center border-b pb-3 mb-3">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">A</div>
                    <span className="ml-2 font-medium">Ahmed Olawale</span>
                  </div>
                  <div className="text-emerald-700 font-bold">
                    Position: 1st
                  </div>
                </div>
                <div className="space-y-2">
                  {["Mathematics", "English", "Science"].map(subject => (
                    <div key={subject} className="flex justify-between">
                      <span>{subject}</span>
                      <span className="font-medium text-emerald-700">A</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-3 flex justify-between font-bold">
                    <span>Average</span>
                    <span className="text-emerald-700">92.5%</span>
                  </div>
                </div>
              </div>
              <p className="text-emerald-700 font-medium mt-4">Result Card Preview</p>
            </div>
          </div>
        </section>
        
        {/* Enhanced Features Section */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-emerald-600 font-medium">POWERFUL FEATURES</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Why Choose ScoreDesk?</h2>
              <div className="h-1 w-24 bg-emerald-700 mx-auto rounded-full mb-4"></div>
              <p className="max-w-2xl mx-auto text-gray-600">Our powerful yet intuitive platform is designed specifically for Nigerian schools with features that simplify result management.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl border-b-4 border-transparent hover:border-emerald-500 transition-all duration-300 feature-card">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-full inline-flex mb-6 group-hover:bg-emerald-100 transition-all duration-300">
                  <Users className="h-7 w-7 text-emerald-700" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-800">Multi-School Support</h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors">Each school gets their unique environment with custom logos, term settings, and user management.</p>
                <div className="mt-4 h-1 w-10 bg-emerald-200 group-hover:w-16 group-hover:bg-emerald-500 transition-all duration-300"></div>
              </div>
              
              <div className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl border-b-4 border-transparent hover:border-emerald-500 transition-all duration-300 feature-card">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-full inline-flex mb-6 group-hover:bg-emerald-100 transition-all duration-300">
                  <Shield className="h-7 w-7 text-emerald-700" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-800">Role-Based Access</h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors">Different user roles with appropriate permissions for principals, teachers, and administrators.</p>
                <div className="mt-4 h-1 w-10 bg-emerald-200 group-hover:w-16 group-hover:bg-emerald-500 transition-all duration-300"></div>
              </div>
              
              <div className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl border-b-4 border-transparent hover:border-emerald-500 transition-all duration-300 feature-card">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-full inline-flex mb-6 group-hover:bg-emerald-100 transition-all duration-300">
                  <Trophy className="h-7 w-7 text-emerald-700" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-800">Nigerian-Style Grading</h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors">Auto-calculate class positions with tied ranking support and customizable grading systems.</p>
                <div className="mt-4 h-1 w-10 bg-emerald-200 group-hover:w-16 group-hover:bg-emerald-500 transition-all duration-300"></div>
              </div>
              
              <div className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl border-b-4 border-transparent hover:border-emerald-500 transition-all duration-300 feature-card">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-full inline-flex mb-6 group-hover:bg-emerald-100 transition-all duration-300">
                  <Settings className="h-7 w-7 text-emerald-700" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-800">Customizable Templates</h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors">Choose from pre-designed report card templates or create your own with our drag-and-drop builder.</p>
                <div className="mt-4 h-1 w-10 bg-emerald-200 group-hover:w-16 group-hover:bg-emerald-500 transition-all duration-300"></div>
              </div>
              
              <div className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl border-b-4 border-transparent hover:border-emerald-500 transition-all duration-300 feature-card">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-full inline-flex mb-6 group-hover:bg-emerald-100 transition-all duration-300">
                  <GraduationCap className="h-7 w-7 text-emerald-700" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-800">Student Result Portal</h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors">Generate scratch cards for students and parents to access results securely.</p>
                <div className="mt-4 h-1 w-10 bg-emerald-200 group-hover:w-16 group-hover:bg-emerald-500 transition-all duration-300"></div>
              </div>
              
              <div className="group bg-white p-8 rounded-xl shadow-lg hover:shadow-xl border-b-4 border-transparent hover:border-emerald-500 transition-all duration-300 feature-card">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-full inline-flex mb-6 group-hover:bg-emerald-100 transition-all duration-300">
                  <BarChart3 className="h-7 w-7 text-emerald-700" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-800">Analytics Dashboard</h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors">Track subject performance, class averages, and identify areas for improvement.</p>
                <div className="mt-4 h-1 w-10 bg-emerald-200 group-hover:w-16 group-hover:bg-emerald-500 transition-all duration-300"></div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Enhanced CTA Section */}
        <section className="bg-gradient-primary py-20 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to transform your school's result management?</h2>
            <p className="mb-10 max-w-2xl mx-auto text-white/90">Join hundreds of Nigerian schools already using ScoreDesk to streamline their result processing and improve academic outcomes.</p>
            <Button 
              className="bg-white text-emerald-700 hover:bg-gray-100 px-8 py-6 text-lg shadow-xl hover-scale" 
              onClick={() => navigate("/signup")}
            >
              Start Your Free Trial
            </Button>
            
            {/* Testimonial */}
            <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-xl p-8 max-w-3xl mx-auto">
              <p className="italic text-lg mb-6">"ScoreDesk has revolutionized how we manage our student results. What used to take weeks now takes just days, and the reports are more professional than ever."</p>
              <div>
                <p className="font-bold">Mrs. Adeola Johnson</p>
                <p className="text-sm text-white/80">Principal, Green Valley College</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16 font-roboto">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-emerald-700 text-white p-1 rounded-md">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="font-bold text-xl">ScoreDesk</span>
              </div>
              <p className="max-w-xs text-gray-400">The ultimate result management system for Nigerian schools, designed to simplify academic record keeping.</p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H9v-3h2V8.5C11 6.57 12.57 5 14.5 5H17v3h-1.5c-.55 0-1 .45-1 1v1h2.5v3H14.5v4H11z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-emerald-300 transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-emerald-300 transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-emerald-300 transition-colors">Demo</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/documentation" className="hover:text-emerald-300 transition-colors">Documentation</Link></li>
                  <li><Link to="/documentation" className="hover:text-emerald-300 transition-colors">Tutorials</Link></li>
                  <li><Link to="/blog" className="hover:text-emerald-300 transition-colors">Blog</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Contact</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="tel:09063412927" className="hover:text-emerald-300 transition-colors">Phone: 09063412927</a></li>
                  <li><span className="hover:text-emerald-300 transition-colors">Address: Abuja, Nigeria</span></li>
                  <li><a href="mailto:scoredesk.ng@gmail.com" className="hover:text-emerald-300 transition-colors">Email: scoredesk.ng@gmail.com</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">&copy; 2025 ScoreDesk by Binah Innovation. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link to="/privacy-policy" className="text-gray-400 hover:text-emerald-300 transition-colors">Privacy Policy</Link>
              <Link to="/terms-of-service" className="text-gray-400 hover:text-emerald-300 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
