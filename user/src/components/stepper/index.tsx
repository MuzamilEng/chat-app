import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useTranslationContext } from 'context/TranslationContext';

interface Props {
  steps: string[];
  activeStep: number;
  completed: { [k: number]: boolean };
  handleComplete: () => void;
  handleBack: () => void;
  handleNext: () => void;
}

export default function HorizontalNonLinearStepper({ steps, activeStep, completed, handleComplete, handleBack, handleNext}: Props) {
  const totalSteps = steps.length;
  const completedSteps = () => Object.keys(completed).length;
  const isLastStep = activeStep === totalSteps -1;
  const allStepsCompleted = completedSteps() === totalSteps;
  const { currentStep } = useTranslationContext();

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper nonLinear activeStep={activeStep}>
        {steps.map((label, index) => (
          <Step key={label} completed={completed[index]}>
            <StepButton onClick={() => { if (completed[index]) console.log(`Step ${index + 1}`); }}>
              {label}
            </StepButton>
          </Step>
        ))}
      </Stepper>

      <div>
        {allStepsCompleted ? (
          <Typography sx={{ mt: 2, mb: 1 }}>All steps completed - you&apos;re finished</Typography>
        ) : (
          <React.Fragment>
            <Typography sx={{ mt: 2, mb: 1 }}>Step {activeStep + 1}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant="contained"
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Back
              </Button>

              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!completed[activeStep]}
              >
                {isLastStep ? 'Finish' : 'Next'}
              </Button>
            </Box>
          </React.Fragment>
        )}
      </div>
    </Box>
  );
}
