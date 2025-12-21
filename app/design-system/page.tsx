'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Check, X, AlertCircle, Info, Upload, Download,
  User, Settings, LogOut, Search, Plus
} from 'lucide-react';

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">ContaSync Design System</h1>
          <p className="text-muted-foreground">
            Design tokens, components, and patterns
          </p>
        </div>

        <Separator />

        {/* Typography */}
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Typography</h2>
            <p className="text-muted-foreground">Font: Inter</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Heading Scales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">text-4xl (36px)</p>
                <h1 className="text-4xl font-bold">The quick brown fox</h1>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">text-3xl (30px)</p>
                <h2 className="text-3xl font-bold">The quick brown fox</h2>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">text-2xl (24px)</p>
                <h3 className="text-2xl font-semibold">The quick brown fox</h3>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">text-xl (20px)</p>
                <h4 className="text-xl font-semibold">The quick brown fox</h4>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">text-lg (18px)</p>
                <h5 className="text-lg font-medium">The quick brown fox</h5>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">text-base (16px)</p>
                <p className="text-base">The quick brown fox jumps over the lazy dog</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">text-sm (14px)</p>
                <p className="text-sm">The quick brown fox jumps over the lazy dog</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">text-xs (12px)</p>
                <p className="text-xs">The quick brown fox jumps over the lazy dog</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Colors */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Color System</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Primary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-20 rounded-md bg-primary border" />
                <p className="text-xs text-muted-foreground">var(--primary)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Secondary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-20 rounded-md bg-secondary border" />
                <p className="text-xs text-muted-foreground">var(--secondary)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Destructive</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-20 rounded-md bg-destructive border" />
                <p className="text-xs text-muted-foreground">var(--destructive)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Muted</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="h-20 rounded-md bg-muted border" />
                <p className="text-xs text-muted-foreground">var(--muted)</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Buttons */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Buttons</h2>

          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Button Sizes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon"><Plus className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Buttons with Icons (Lucide React)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button variant="destructive">
                  <X className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <Button variant="secondary">
                  <Check className="mr-2 h-4 w-4" />
                  Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Form Components */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Form Components</h2>

          <Card>
            <CardHeader>
              <CardTitle>Input & Label</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disabled">Disabled Input</Label>
                <Input id="disabled" placeholder="Disabled" disabled />
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Badges */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Badges</h2>

          <Card>
            <CardHeader>
              <CardTitle>Badge Variants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Alerts */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Alerts</h2>

          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This is an informational alert.
              </AlertDescription>
            </Alert>

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This is a destructive/error alert.
              </AlertDescription>
            </Alert>
          </div>
        </section>

        <Separator />

        {/* Spacing */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Spacing Scale</h2>

          <Card>
            <CardHeader>
              <CardTitle>Padding/Margin Scale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm text-muted-foreground">p-2 (0.5rem)</div>
                <div className="p-2 bg-primary/10 border rounded">Content</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm text-muted-foreground">p-4 (1rem)</div>
                <div className="p-4 bg-primary/10 border rounded">Content</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm text-muted-foreground">p-6 (1.5rem)</div>
                <div className="p-6 bg-primary/10 border rounded">Content</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 text-sm text-muted-foreground">p-8 (2rem)</div>
                <div className="p-8 bg-primary/10 border rounded">Content</div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Border Radius */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Border Radius</h2>

          <Card>
            <CardHeader>
              <CardTitle>Radius Scale</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-32 text-sm text-muted-foreground">rounded-sm</div>
                <div className="w-24 h-24 bg-primary/10 border rounded-sm" />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 text-sm text-muted-foreground">rounded-md</div>
                <div className="w-24 h-24 bg-primary/10 border rounded-md" />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 text-sm text-muted-foreground">rounded-lg</div>
                <div className="w-24 h-24 bg-primary/10 border rounded-lg" />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 text-sm text-muted-foreground">rounded-xl</div>
                <div className="w-24 h-24 bg-primary/10 border rounded-xl" />
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Icons */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold">Lucide Icons</h2>

          <Card>
            <CardHeader>
              <CardTitle>Icon Examples</CardTitle>
              <CardDescription>From lucide-react package</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <User className="h-6 w-6" />
                <Settings className="h-6 w-6" />
                <LogOut className="h-6 w-6" />
                <Search className="h-6 w-6" />
                <Upload className="h-6 w-6" />
                <Download className="h-6 w-6" />
                <Plus className="h-6 w-6" />
                <X className="h-6 w-6" />
                <Check className="h-6 w-6" />
                <AlertCircle className="h-6 w-6" />
                <Info className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
