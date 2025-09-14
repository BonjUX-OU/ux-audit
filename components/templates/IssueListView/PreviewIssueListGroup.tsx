import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { IssueListViewProps } from "./IssueListView";

const PreviewIssueListGroup = ({
  issues,
  onRegisterClick,
  issueCount,
  title,
}: IssueListViewProps & { title: string; issueCount: number }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="p-2 text-center font-medium border bg-[#FFF1E0]">
        {title} ({issues.length})
      </div>
      <Accordion type="single" collapsible>
        {issues.map((issue) => (
          <AccordionItem
            key={issue.heuristic.code + "-" + issue.order}
            value={issue.heuristic.code + "." + issue.order}
            className="mb-4 bg-white px-4 border rounded-md">
            <AccordionTrigger>
              Issue {issue.heuristic.code}.{issue.order}
            </AccordionTrigger>
            <AccordionContent>
              <div className="p-3 h-auto flex flex-col items-center gap-3">
                <h1 className="w-full text-md font-medium">Reveal {issueCount} more issues by purchasing this report</h1>
                <span className="text-md font-normal">
                  To access the full report, you’ll need to register and complete the payment. Once registered, you’ll
                  be redirected to the Stripe page to finalize your purchase.
                </span>
                <h1 className="w-full text-2xl font-semibold">Just €14.90</h1>
                <Button onClick={onRegisterClick} className="w-full py-6 bg-[#B04E34] hover:bg-[#963F28] text-white">
                  Register & Purchase full report
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default PreviewIssueListGroup;
