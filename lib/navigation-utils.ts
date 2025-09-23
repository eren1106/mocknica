/**
 * Navigation utility functions for determining active states and normalizing paths
 */

/**
 * Normalizes a path by removing trailing slashes
 */
export const normalizePath = (path: string): string => path.replace(/\/+$/, "");

/**
 * Checks if a navigation item is selected based on the current pathname
 * @param to - The navigation item's route
 * @param pathname - The current pathname
 * @returns Whether the navigation item is active
 */
export const checkIsNavSelected = (to: string, pathname: string): boolean => {
  const currentPath = normalizePath(pathname);
  const rootPath = normalizePath("/");

  // Handle root/home route
  if (to === "") {
    return currentPath === rootPath;
  }

  const pathPrefix = normalizePath(`/${to}`);
  return currentPath.startsWith(pathPrefix);
};

/**
 * Checks if a project navigation item is selected
 * @param to - The project navigation item's route
 * @param pathname - The current pathname
 * @param projectId - The current project ID
 * @returns Whether the project navigation item is active
 */
export const checkIsProjectNavSelected = (
  to: string,
  pathname: string,
  projectId: string
): boolean => {
  const currentPath = normalizePath(pathname);

  // For the overview page (empty to)
  if (to === "") {
    return currentPath === `/projects/${projectId}`;
  }

  const expectedPath = normalizePath(`/projects/${projectId}/${to}`);
  return currentPath === expectedPath;
};

/**
 * Generates the href for a navigation item
 * @param to - The navigation item's route
 * @returns The complete href
 */
export const getNavHref = (to: string): string => {
  return to === "" ? "/" : `/${to}`;
};

/**
 * Generates the href for a project navigation item
 * @param to - The project navigation item's route
 * @param projectId - The current project ID
 * @returns The complete href
 */
export const getProjectNavHref = (to: string, projectId: string): string => {
  return `/projects/${projectId}/${to}`;
};

/**
 * Determines if the current path is within a project context
 * @param pathname - The current pathname
 * @param projectId - The current project ID
 * @returns Whether we're in a project context
 */
export const isInProjectContext = (pathname: string, projectId?: string): boolean => {
  return pathname.startsWith("/projects/") && !!projectId && pathname !== "/projects";
};