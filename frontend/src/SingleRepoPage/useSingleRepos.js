import { useEffect, useState } from "react";

function useSingleRepo(id) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getFromApi = async () => {
      try {
        const r = await fetch(`/api/user/getData/${id}`);
        console.log("r: ", r);
        const res = await r.json();
        setData(res);
        console.log("res: ", res);
        setLoading(false);
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    };

    getFromApi();
  }, []);

  return { loading, data, error };
}

export default useSingleRepo;
