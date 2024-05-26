export const getParams = (params) => {
  const index = params.indexOf("=");
  const stringAfterCut = params.slice(index + 1);
  return stringAfterCut;
};
