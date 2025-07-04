  import {  Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ShineBorder } from "@/components/magicui/shine-border";
import { MagicCard } from "@/components/magicui/magic-card";
import { RainbowButton } from "@/components/magicui/rainbow-button";

function Section2() {
    return (
        <div className=" min-h-screen py-12 px-4">
            <div className="container mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-slate-100 mb-4">How It Works</h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Get started with TypingTest Hub in just 5 simple steps
                    </p>
                </div>

                {/* Grid Layout */}
            <div className=" flex flex-col md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto justify-center items-center">

                    {/* Step 1 - Login */}
                    <Card className="relative overflow-hidden max-w-[350px] w-full bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:bg-slate-750 transition-all duration-300 hover:scale-105 group">
                        <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
                        <CardContent className="p-6 text-center">
                            <div className="w-16 h-16 bg-slate-700 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:bg-slate-600 transition-colors">
                                <span className="text-slate-100 font-bold text-2xl">1</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-100 mb-4">Login</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Sign in to your account or create a new one to get started with TypingTest Hub
                            </p>
                        </CardContent>
                    </Card>

                    {/* Step 2 - Create a Room */}
                    <Card className="relative overflow-hidden max-w-[350px] w-full bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:bg-slate-750 transition-all duration-300 hover:scale-105 group">
                        <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
                        <CardContent className="p-6 text-center">
                            <div className="w-16 h-16 bg-slate-700 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:bg-slate-600 transition-colors">
                                <span className="text-slate-100 font-bold text-2xl">2</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-100 mb-4">Create a Room</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Click on "Create Room" to set up a new typing test session for you and your friends
                            </p>
                        </CardContent>
                    </Card>

                    {/* Step 3 - You Have a Code */}
                    <Card className="relative overflow-hidden max-w-[350px] w-full bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:bg-slate-750 transition-all duration-300 hover:scale-105 group">
                        <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
                        
                        <CardContent className="p-6 text-center">
                            <div className="w-16 h-16 bg-slate-700 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:bg-slate-600 transition-colors">
                                <span className="text-slate-100 font-bold text-2xl">3</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-100 mb-4">You Have a Code</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Once your room is created, you'll receive a unique room code to share with others
                            </p>
                        </CardContent>
                    </Card>
                    
                    {/* Step 4 - Share with Friends */}
                    <Card className="relative overflow-hidden max-w-[350px] w-full bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:bg-slate-750 transition-all duration-300 hover:scale-105 group">
                        <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
                        <CardContent className="p-6 text-center">
                            <div className="w-16 h-16 bg-slate-700 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:bg-slate-600 transition-colors">
                                <span className="text-slate-100 font-bold text-2xl">4</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-100 mb-4">Share with Friends</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Send the room code to your friends and let them join your typing session
                            </p>
                        </CardContent>
                    </Card>

                    {/* Step 5 - Start Typing */}
                    <Card className="relative overflow-hidden max-w-[350px] w-full bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:bg-slate-750 transition-all duration-300 hover:scale-105 group md:col-start-2 lg:col-start-2">
                        <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
                        <CardContent className="p-6 text-center">
                            <div className="w-16 h-16 bg-slate-700 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:bg-slate-600 transition-colors">
                                <span className="text-slate-100 font-bold text-2xl">5</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-100 mb-4">Start Typing</h3>
                            <p className="text-slate-400 leading-relaxed">
                                Once everyone has joined, click "Start" and begin your competitive typing test together!
                            </p>
                            <div className="mt-6">
                             
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional CTA Section */}
                <div className="text-center mt-12">
                 
                    <div >
                        <MagicCard
                            gradientColor={"#262626"}
                            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl mx-auto"
                        >
                        <h3 className="text-2xl font-bold text-slate-100 mb-4">Ready to Test Your Speed?</h3>
                        <p className="text-slate-400 mb-6">
                            Join thousands of users improving their typing skills with competitive multiplayer tests
                            </p>
                            <RainbowButton variant="outline">Get Started Now</RainbowButton>
                       
            </MagicCard>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Section2