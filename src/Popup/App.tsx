import { motion } from "framer-motion";
import React, { useEffect, FunctionComponent as FC } from "react";

const App: FC = () => {
  console.log("Behrooza");
  useEffect(() => {
    console.log("Behrooz");
    chrome.runtime.sendMessage({ text: "hey" }, function (response) {
      console.log("Response: ", response);
    });
  }, []);

  return (
    <motion.h1
      animate={{ x: [50, 150, 50], opacity: 1, scale: 1 }}
      transition={{
        duration: 5,
        delay: 0.3,
        ease: [0.5, 0.71, 1, 1.5]
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      whileHover={{ scale: 1.2 }}
    >
      Animation made easy with Framer Motion
    </motion.h1>
  );
};

export default App;
