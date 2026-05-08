import { createContext, useContext, useState, useCallback } from 'react';

const ResumeContext = createContext(null);

export function ResumeProvider({ children }) {
  const [resumeData, setResumeDataState] = useState(() => {
    try {
      const stored = localStorage.getItem('resumeData');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setResumeData = useCallback((data) => {
    setResumeDataState(data);
    if (data) {
      localStorage.setItem('resumeData', JSON.stringify(data));
    } else {
      localStorage.removeItem('resumeData');
    }
  }, []);

  const clearResume = useCallback(() => setResumeData(null), [setResumeData]);

  return (
    <ResumeContext.Provider value={{ resumeData, setResumeData, clearResume }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  return useContext(ResumeContext);
}
