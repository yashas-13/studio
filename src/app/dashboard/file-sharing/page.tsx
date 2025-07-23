import {
  File,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const files = [
  { name: "Tower-Structural-Blueprints.pdf", type: "Blueprint", uploadedBy: "John O.", role: "Owner", date: "2024-07-20", size: "15.2 MB" },
  { name: "North-Bridge-Geotech-Report.docx", type: "Report", uploadedBy: "Emily E.", role: "Engineer", date: "2024-07-18", size: "2.1 MB" },
  { name: "Plumbing-Schematics-Rev2.pdf", type: "Schematic", uploadedBy: "John O.", role: "Owner", date: "2024-07-15", size: "5.8 MB" },
  { name: "HVAC-Load-Calculations.xlsx", type: "Calculation", uploadedBy: "Emily E.", role: "Engineer", date: "2024-07-12", size: "780 KB" },
  { name: "Site-Logistic-Plan.pdf", type: "Plan", uploadedBy: "John O.", role: "Owner", date: "2024-07-10", size: "3.4 MB" },
];

export default function FileSharingPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">File Sharing</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <ListFilter className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Filter
            </span>
          </Button>
          <Button size="sm" className="h-8 gap-1">
            <Upload className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Upload File
            </span>
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Project Documents</CardTitle>
          <CardDescription>
            A central repository for owners and engineers to exchange files.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Uploaded By</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{file.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                     <Badge variant="outline">{file.type}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                       <Avatar className="h-6 w-6">
                         <AvatarImage src={`https://i.pravatar.cc/40?u=${file.uploadedBy}`} alt="Avatar" />
                         <AvatarFallback>{file.uploadedBy.charAt(0)}</AvatarFallback>
                       </Avatar>
                       <div>
                        <p className="text-sm font-medium">{file.uploadedBy}</p>
                        <p className="text-xs text-muted-foreground">{file.role}</p>
                       </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{file.date}</TableCell>
                  <TableCell className="text-right">{file.size}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Download</DropdownMenuItem>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
         <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-5</strong> of <strong>24</strong> files
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
