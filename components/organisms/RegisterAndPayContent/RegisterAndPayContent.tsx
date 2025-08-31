import { Button } from "@/components/ui/button";

type RegisterAndPayContentProps = {
  issueCount: number;
  onRegisterClick: () => void;
  hasPaid?: boolean;
};

const RegisterAndPayContent = ({ hasPaid, issueCount, onRegisterClick }: RegisterAndPayContentProps) => {
  if (hasPaid) {
    return (
      <div className="p-4 h-auto flex flex-col items-center text-center gap-5 bg-[#FFF1E0]">
        <div className="w-full flex items-center justify-center">
          <h1 className="text-[#B04E34] text-3xl bold my-4">Purchased already!</h1>
        </div>
        <div className="w-full">
          <span className="text-md font-[300] text-[#B04E34]">
            This audit has been already purchased by someone else! If you know the owner you can request an access by
            the owner.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-auto flex flex-col items-center text-center gap-5 bg-[#FFF1E0]">
      <div className="w-full flex items-center justify-center">
        <h1 className="text-[#B04E34] text-3xl bold my-4">Get your full report just €14.99</h1>
      </div>
      <div className="w-full">
        <span className="text-md font-[300] text-[#B04E34]">
          We have found {issueCount} issues for this page. If you want to get the full report you need to pay first. You
          will be directed to the Stripe page.
        </span>
      </div>

      <div className="flex">
        <Button onClick={onRegisterClick} className="w-full py-6 bg-[#B04E34] hover:bg-[#963F28] text-white">
          Register & Purchase full report
        </Button>
      </div>
    </div>
  );
};

export default RegisterAndPayContent;
