import logoStarEyes from "@/public/logo-star-eyes.svg";
import Image from "next/image";

const LogoStarEyes = () => {
  return (
    <Image src={logoStarEyes} alt="Logo Star Eyes" width={100} height={100} />
    // <div className="bg-[#E84C30] rounded-full w-32 h-32 flex items-center justify-center mb-8">
    //   <span className="text-white text-4xl font-bold">0.0</span>
    // </div>
  );
};

export default LogoStarEyes;
