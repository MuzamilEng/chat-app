import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepButton from '@mui/material/StepButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useSelector } from 'react-redux';
import { useTranslationContext } from 'context/TranslationContext';

interface Props {
  steps: string[];
  activeStep: number;
  completed: { [k: number]: boolean };
  handleComplete: () => void;
}

export default function HorizontalNonLinearStepper({ steps, activeStep, completed, handleComplete }: Props) {
  const authUser = useSelector((state: any) => state?.auth?.authUser);
  const totalSteps = steps.length;
  const completedSteps = () => Object.keys(completed).length;
  const {currentUser} = useTranslationContext()

  const isLastStep = () => activeStep === totalSteps - 1;
  const allStepsCompleted = () => completedSteps() === totalSteps;

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper nonLinear activeStep={activeStep}>
        {steps.map((label, index) => (
          <Step key={label} completed={completed[index]}>
            <StepButton color="inherit" onClick={() => { if (authUser) console.log(`Step ${index + 1}`); }}>
              {label}
            </StepButton>
          </Step>
        ))}
      </Stepper>
      {/* <div>
        {currentUser === null && authUser == null ? (
          <Typography sx={{ mt: 2, mb: 1, color: 'white', fontWeight: 'bold' }}>
            You must complete the 1st step to proceed.
          </Typography>
        ) : allStepsCompleted() ? (
          <React.Fragment>
            <Typography sx={{ mt: 2, mb: 1 }}>
              All steps completed - you&apos;re finished
            </Typography>
            <Button onClick={() => console.log('Reset')}>Reset</Button>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Typography sx={{ mt: 2, mb: 1, py: 1, color: '#fff', fontWeight: 'bold' }}>
              Step {activeStep + 1}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                style={{ backgroundColor: '#fff', color: '#000', cursor: 'pointer' }}
                variant="contained"
                disabled={activeStep === 0}
                >
                Back
              </Button>
              <Button variant="contained" onClick={handleComplete} disabled={activeStep === totalSteps - 1}>
                {activeStep === totalSteps - 1 ? 'Finish' : 'Next'}
              </Button>
            </Box>
          </React.Fragment>
        )}
      </div> */}
    </Box>
  );
}