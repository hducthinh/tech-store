import { Project } from "ts-morph";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const project = new Project({
    compilerOptions: { allowJs: true }
  });

  project.addSourceFilesAtPaths("src/**/*.js");
  project.addSourceFilesAtPaths("src/**/*.jsx");

  const targetAdmin = path.resolve(__dirname, "src/features/admin");
  const targetAdminComponents = path.resolve(__dirname, "src/features/admin/components");
  const targetAdminHooks = path.resolve(__dirname, "src/features/admin/hooks");

  // 1. Pages
  const adminPages = project.getSourceFiles("src/pages/admin/src/features/admin/*.jsx");
  for (const file of adminPages) {
    file.moveToDirectory(targetAdmin);
  }

  // 2. Components inside AdminTable
  const adminTableFiles = project.getSourceFiles("src/components/admin/AdminTable/src/features/admin/components/AdminTable/*.jsx");
  for (const file of adminTableFiles) {
    file.moveToDirectory(path.resolve(targetAdminComponents, "AdminTable"));
  }

  // 3. Components inside pages/admin/components
  const pageAdminComponents = project.getSourceFiles("src/pages/admin/components/*.jsx");
  for (const file of pageAdminComponents) {
    file.moveToDirectory(targetAdminComponents);
  }

  // 4. Hooks
  const useDashboard = project.getSourceFile("src/hooks/src/features/admin/hooks/useDashboard.js");
  if (useDashboard) {
    useDashboard.moveToDirectory(targetAdminHooks);
  }

  await project.save();
  console.log("Fixed!");
}
main().catch(console.error);
