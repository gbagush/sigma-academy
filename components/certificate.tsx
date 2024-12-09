import { Logo } from "@/components/icons";

export const Certificate = ({
  certificateData,
}: {
  certificateData: {
    id: string;
    recipient: string;
    title: string;
    date: string;
    instructor: string;
  };
}) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8 w-full">
      <div className="flex items-center gap-2 mb-6">
        <Logo />
        <span>Sigma Academy</span>
      </div>

      <h1 className="text-4xl font-serif text-center mb-4">
        Certificate of Completion
      </h1>

      <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6"></div>

      <p className="text-xl text-center mb-6">This is to certify that</p>

      <h2 className="text-3xl font-bold text-center border-b-2 pb-2 mb-6">
        {certificateData.recipient}
      </h2>

      <p className="text-center max-w-lg mb-8">
        has successfully completed all requirements for the course
      </p>

      <h3 className="text-xl font-semibold text-center mb-8">
        {certificateData.title}
      </h3>

      <div className="w-full flex justify-between items-center mt-12">
        <div className="text-center">
          <div className="border-t-2 pt-2">
            <p className="font-bold">{certificateData.date}</p>
            <p className="text-sm">Date of Completion</p>
          </div>
        </div>

        <div className="text-center">
          <div className="border-t-2 pt-2">
            <p className="font-bold">{certificateData.instructor}</p>
            <p className="text-sm">Program Director</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-sm">Certificate ID: {certificateData.id}</div>
      <div className="text-xs text-foreground/75">
        Check validity of this certificate at{" "}
        <span className="text-blue-500">
          {process.env.NEXT_PUBLIC_BASE_URL}
          /certificate/verify
        </span>
      </div>
    </div>
  );
};
