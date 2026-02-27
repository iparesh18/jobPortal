import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { useSelector } from "react-redux";

const AppliedJobTable = () => {
  const { allAppliedJobs } = useSelector((store) => store.job);

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>A list of your applied jobs</TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Job Role</TableHead>
            <TableHead>Company</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {allAppliedJobs?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6">
                You haven't applied for any jobs yet.
              </TableCell>
            </TableRow>
          ) : (
            allAppliedJobs?.map((appliedJob) => {
              const status = appliedJob?.status || "pending";

              return (
                <TableRow key={appliedJob._id}>
                  <TableCell>
                    {appliedJob?.createdAt?.split("T")[0]}
                  </TableCell>

                  <TableCell>
                    {appliedJob?.job?.title || "N/A"}
                  </TableCell>

                  <TableCell>
                    {appliedJob?.job?.company?.name || "N/A"}
                  </TableCell>

                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={`capitalize font-medium
                        ${
                          status === "rejected"
                            ? "border-red-500 text-red-600"
                            : status === "pending"
                            ? "border-yellow-500 text-yellow-600"
                            : "border-green-500 text-green-600"
                        }`}
                    >
                      {status}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AppliedJobTable;