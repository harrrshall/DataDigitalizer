import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"

export function Pricing() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-background border-b">
        <div className="container px-4 md:px-6 py-4 flex items-center justify-between">
          <Link href="#" className="flex items-center gap-2 font-semibold text-lg" prefetch={false}>
            <MountainIcon className="w-6 h-6" />
            <span>Data Digitizer</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#" className="text-muted-foreground hover:text-foreground" prefetch={false}>
              Features
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground" prefetch={false}>
              Pricing
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground" prefetch={false}>
              About
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground" prefetch={false}>
              Contact
            </Link>
          </nav>
          <Button>Sign Up</Button>
        </div>
      </header>
      <main className="flex-1 py-12 md:py-24">
        <div className="container px-4 md:px-6 grid gap-8 md:gap-12">
          <div className="text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold">Pricing</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Start with a free plan, then upgrade as you grow. No hidden fees, no surprises.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 hover:bg-muted/40 transition-colors">
            <Card className="bg-muted/20 border">
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <div className="text-4xl font-bold">$0</div>
                <div className="text-sm text-muted-foreground">/month</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-medium">Data Processing</div>
                  <div className="text-muted-foreground">100 MB/month</div>
                </div>
                <div>
                  <div className="font-medium">Storage</div>
                  <div className="text-muted-foreground">1 GB</div>
                </div>
                <div>
                  <div className="font-medium">API Calls</div>
                  <div className="text-muted-foreground">1,000/month</div>
                </div>
                <div>
                  <div className="font-medium">Support</div>
                  <div className="text-muted-foreground">Community</div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Start for Free
                </Button>
              </CardFooter>
            </Card>
            <Card className="bg-muted/20 border">
              <CardHeader>
                <CardTitle>Premium</CardTitle>
                <div className="text-4xl font-bold">$49</div>
                <div className="text-sm text-muted-foreground">/month</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-medium">Data Processing</div>
                  <div className="text-muted-foreground">5 GB/month</div>
                </div>
                <div>
                  <div className="font-medium">Storage</div>
                  <div className="text-muted-foreground">50 GB</div>
                </div>
                <div>
                  <div className="font-medium">API Calls</div>
                  <div className="text-muted-foreground">50,000/month</div>
                </div>
                <div>
                  <div className="font-medium">Support</div>
                  <div className="text-muted-foreground">Email, 24/7</div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Upgrade to Premium</Button>
              </CardFooter>
            </Card>
            <Card className="bg-muted/20 border">
              <CardHeader>
                <CardTitle>Ads</CardTitle>
                <div className="text-4xl font-bold">$99</div>
                <div className="text-sm text-muted-foreground">/month</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-medium">Data Processing</div>
                  <div className="text-muted-foreground">Unlimited</div>
                </div>
                <div>
                  <div className="font-medium">Storage</div>
                  <div className="text-muted-foreground">Unlimited</div>
                </div>
                <div>
                  <div className="font-medium">API Calls</div>
                  <div className="text-muted-foreground">Unlimited</div>
                </div>
                <div>
                  <div className="font-medium">Support</div>
                  <div className="text-muted-foreground">Email, Phone, 24/7</div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Upgrade to Ads</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <footer className="bg-muted/20 border-t">
        <div className="container px-4 md:px-6 py-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">&copy; 2024 Data Digitizer. All rights reserved.</div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#" className="text-muted-foreground hover:text-foreground" prefetch={false}>
              Terms
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground" prefetch={false}>
              Privacy
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground" prefetch={false}>
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

interface IconProps {
  className?: string;
  [key: string]: any;
}

function MountainIcon(props: IconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  )
}

function XIcon(props: IconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}