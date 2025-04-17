import { useTabStore } from "@/store/tab";
import { styled } from "goober";
import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  handleClick() {
    useTabStore.getState().resetTabs()
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return <ErrorBoundaryWrapper>
        <h1>
          Something went wrong
          Please reset app
        </h1>
        <ResetButton onClick={this.handleClick}>Reset app</ResetButton>
      </ErrorBoundaryWrapper>
    }

    return this.props.children;
  }
}

export const ErrorBoundaryWrapper = styled("div")`
background-color: var(--bg); 
color: white;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
height: 100vh;
text-align: center;
font-family: Seogo UI, sans-serif;
`;

export const ResetButton = styled("button")`
background-color: var(--accent);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: var(--accent-dark); 
  }
`;