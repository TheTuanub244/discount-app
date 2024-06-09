export const getParams = (params) => {
  const index = params.indexOf("=");
  const stringAfterCut = params.slice(index + 1);
  return stringAfterCut;
};
export const getIdFromUrl = (params) => {
  const splitByDash = params.split("/");
  return {
    type: splitByDash[3],
    id: splitByDash[4],
  };
};
