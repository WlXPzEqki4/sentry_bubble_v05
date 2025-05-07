
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow mt-16">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Welcome to Your New Project
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  A clean slate to build something amazing. Start editing and bring your ideas to life.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg">Get Started</Button>
                <Button variant="outline" size="lg">Learn More</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Key Features
              </h2>
              <p className="mt-4 text-muted-foreground">
                Everything you need to get started
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>React</CardTitle>
                  <CardDescription>UI Library</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Build dynamic user interfaces with the popular React library.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>TypeScript</CardTitle>
                  <CardDescription>Type Safety</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Develop with confidence using TypeScript's static type checking.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Tailwind CSS</CardTitle>
                  <CardDescription>Styling</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Create beautiful designs with Tailwind's utility-first CSS framework.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Get Started?
              </h2>
              <p className="mt-4 mb-8 text-muted-foreground md:text-xl">
                Start building your application by editing the code. The possibilities are endless.
              </p>
              <Button size="lg">Begin Now</Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
