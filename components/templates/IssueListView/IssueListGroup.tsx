import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { IssueListViewProps } from "./IssueListView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type IssueListGroupProps = IssueListViewProps & {
  title: string;
  previewIssuesCount?: number;
};

const IssueListGroup = ({
  issues,
  title,
  previewIssues,
  previewIssuesCount,
  isPaidReport,
  onRegisterClick,
}: IssueListGroupProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="p-2 text-center font-medium border bg-[#FFF1E0]">
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
        {previewIssues?.map((issue, index) => (
          <AccordionItem
            key={issue.heuristic.code + "-" + issue.order + "-" + index}
            value={issue.heuristic.code + "." + issue.order}
            className="mb-4 bg-white px-4 border rounded-md">
            <AccordionTrigger>
              Issue {issue.heuristic.code}.{issue.order}
            </AccordionTrigger>
            <AccordionContent>
              {isPaidReport ? (
                <div className="p-3 h-auto flex flex-col items-center gap-3">
                  <div className="w-full flex items-center justify-center">
                    <h1 className="w-full text-lg font-medium text-[#B04E34]">Purchased already!</h1>
                  </div>
                  <div className="w-full">
                    <span className="text-md font-normal">
                      This audit has been already purchased by someone else! If you know the owner you can request an
                      access by the owner.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 h-auto flex flex-col items-center gap-3">
                  <h1 className="w-full text-md font-medium">
                    Reveal {previewIssuesCount} more issues by purchasing this report
                  </h1>
                  <span className="text-md font-normal">
                    To access the full report, you’ll need to register and complete the payment. Once registered, you’ll
                    be redirected to the Stripe page to finalize your purchase.
                  </span>
                  <h1 className="w-full text-2xl font-semibold">Just €14.90</h1>
                  <Button onClick={onRegisterClick} className="w-full py-6 bg-[#B04E34] hover:bg-[#963F28] text-white">
                    Register & Purchase full report
                  </Button>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default IssueListGroup;
