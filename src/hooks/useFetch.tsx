import { useState, useEffect } from "react";

export default function useFetch(url) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted) {
          setData(json);
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));

    return () => {
      isMounted = false; // cleanup para evitar fugas de memoria
    };
  }, [url]);

  return { data, loading };
}
