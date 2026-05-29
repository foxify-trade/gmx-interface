import type { FundedGuideStep } from "domain/funded/funded-types";

import ModalWithPortal from "components/Modal/ModalWithPortal";

export function FundedJourneyGuideModal({
  isVisible,
  setIsVisible,
  steps,
  label = "Journey guide",
}: {
  isVisible: boolean;
  setIsVisible: (isVisible: boolean) => void;
  steps: FundedGuideStep[];
  label?: string;
}) {
  return (
    <ModalWithPortal isVisible={isVisible} setIsVisible={setIsVisible} label={label}>
      <div className="flex flex-col gap-12">
        {steps.map((step, index) => (
          <div key={step.title} className="rounded-8 border border-slate-600 bg-slate-900 px-16 py-14">
            <div className="text-caption">Step {index + 1}</div>
            <div className="mt-8 text-16 font-medium text-typography-primary">{step.title}</div>
            <div className="mt-8 text-13 leading-6 text-typography-secondary">{step.description}</div>
          </div>
        ))}
      </div>
    </ModalWithPortal>
  );
}
