import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

export default function UsagePage() {
  return (
    <div className="grid flex-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
      <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Daily Usage Logs</CardTitle>
            <CardDescription>
              A record of all materials consumed on site.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="hidden md:table-cell">Project Area</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">Logged By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { material: "Ready-Mix Concrete", quantity: "12 m³", area: "Foundation", date: "2024-07-25", user: "O. Martin" },
                  { material: "Steel Rebar", quantity: "1.5 tons", area: "Level 1 Columns", date: "2024-07-25", user: "J. Lee" },
                  { material: "Plywood Sheets", quantity: "50 sheets", area: "Formwork", date: "2024-07-24", user: "O. Martin" },
                  { material: "Electrical Wiring", quantity: "1200 ft", area: "Level 3 Conduit", date: "2024-07-24", user: "S. Nguyen" },
                ].map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.material}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell className="hidden md:table-cell">{item.area}</TableCell>
                    <TableCell className="hidden md:table-cell">{item.date}</TableCell>
                    <TableCell className="hidden md:table-cell">{item.user}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Log Material Consumption</CardTitle>
            <CardDescription>
              Fill out the form to track daily usage.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="material-type">Material Type</Label>
                <Select>
                  <SelectTrigger id="material-type" aria-label="Select material">
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concrete">Ready-Mix Concrete</SelectItem>
                    <SelectItem value="rebar">Steel Rebar</SelectItem>
                    <SelectItem value="plywood">Plywood Sheets</SelectItem>
                    <SelectItem value="wiring">Electrical Wiring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="text" placeholder="e.g., 15 m³" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="project-area">Project Area</Label>
                <Input id="project-area" type="text" placeholder="e.g., Level 12, West Wing" />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea id="notes" placeholder="Any additional notes..." />
              </div>
            </div>
          </CardContent>
          <CardContent>
            <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Submit Usage Log</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
