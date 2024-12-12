import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"

export function Submissions() {
  const submissions = [
    { id: 1, status: "Accepted", runtime: "52 ms", memory: "41.8 MB", language: "JavaScript", submitted: "2 minutes ago" },
    { id: 2, status: "Wrong Answer", runtime: "N/A", memory: "N/A", language: "Python", submitted: "1 hour ago" },
    { id: 3, status: "Time Limit Exceeded", runtime: "N/A", memory: "42.1 MB", language: "Java", submitted: "2 days ago" },
  ]

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Submissions</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Runtime</TableHead>
            <TableHead>Memory</TableHead>
            <TableHead>Language</TableHead>
            <TableHead>Submitted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow key={submission.id}>
              <TableCell>{submission.status}</TableCell><TableCell>{submission.status}</TableCell>
              <TableCell>{submission.runtime}</TableCell>
              <TableCell>{submission.memory}</TableCell>
              <TableCell>{submission.language}</TableCell>
              <TableCell>{submission.submitted}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

