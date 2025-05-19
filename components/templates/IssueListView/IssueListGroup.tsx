import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { IssueListViewProps } from "./IssueListView";
import { Badge } from "@/components/ui/badge";

const IssueListGroup = ({ issues, title }: IssueListViewProps & { title: string }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="p-2 text-center font-[500] border bg-[#FFF1E0]">
        {title} ({issues.length})
      </div>
      <Accordion type="single" collapsible>
        {issues.map((issue) => (
          <AccordionItem
            key={issue._id}
            value={issue.heuristic.code + "." + issue.order}
            className="mb-4 bg-white px-4 border rounded-md">
            <AccordionTrigger>
              Issue {issue.heuristic.code}.{issue.order}
            </AccordionTrigger>
            <AccordionContent>
              <div className="w-full flex items-center justify-center">
                <img
                  src={issue.croppedImageUrl}
                  alt={`${issue.heuristic.code}.${issue.order} snapshot`}
                  style={{ width: 100, border: "1px solid #ccc" }}
                />
              </div>
              <div className="w-full text-md">
                <b>Heuristic: </b>
                {issue.heuristic.name} ({issue.heuristic.code})
              </div>
              <div className="w-full text-md">
                <b>Description: </b>
                {issue.description}
              </div>
              <div className="w-full text-md">
                <b>Suggested Fix: </b>
                {issue.suggestedFix}
              </div>
              <div className="w-full text-md">
                <b>Tags: </b>
                <div className="flex flex-wrap gap-2 mt-2">
                  {issue.tags?.map((tag) => (
                    <Badge
                      variant="outline"
                      key={tag}
                      className="p-2 bg-[#FFF1E0] border-[#B04E34] rounded-lg text-sm font-normal flex items-center gap-2">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default IssueListGroup;
