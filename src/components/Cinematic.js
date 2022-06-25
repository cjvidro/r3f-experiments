import {useCallback, useEffect} from "react";

export default function Cinematic() {
  const toggleCinematic = (element) => {
    element.classList.contains("cinematic") ?  element.classList.remove("cinematic") :  element.classList.add("cinematic");
  };

  const cinematicMode = useCallback((event) => {
    if (event.key === "c" || event.key === "C") {
      toggleCinematic(document.getElementById("topBar"));
      toggleCinematic(document.getElementById("bottomBar"));
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", cinematicMode, false);

    return () => {
      document.removeEventListener("keydown", cinematicMode, false);
    };
  }, [cinematicMode]);
}