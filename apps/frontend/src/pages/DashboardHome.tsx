import OpeningHoursEditor from "./OpeningHoursEditor";
import FaqEditor from "./FaqEditor";

const DashboardHome = () => {
  return (
    <div className="min-h-full w-full bg-neutral-950 py-6 text-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h1 className="mb-6 text-2xl font-semibold">Översikt</h1>

        <div className="flex flex-col gap-8">
          {/* Opening hours widget. */}
          <div>
            <OpeningHoursEditor />
          </div>

          {/* FAQ widget. */}
          <div>
            <FaqEditor />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
