import { Project } from "ts-morph";
import path from "path";
import fs from "fs";

async function main() {
  console.log("Loading project...");
  const project = new Project({
    compilerOptions: {
      allowJs: true
    }
  });

  project.addSourceFilesAtPaths("src/**/*.js");
  project.addSourceFilesAtPaths("src/**/*.jsx");
  project.addSourceFilesAtPaths("src/**/*.ts");
  project.addSourceFilesAtPaths("src/**/*.tsx");

  console.log("Files loaded:", project.getSourceFiles().length);

  // 1. Move pages/admin/* to features/admin/
  const adminPages = project.getSourceFiles("src/pages/admin/*");
  console.log(`Moving ${adminPages.length} admin pages...`);
  for (const file of adminPages) {
    file.moveToDirectory("src/features/admin");
  }

  // 2. Move components/admin/* to features/admin/components/
  const adminComponents = project.getSourceFiles("src/components/admin/**/*");
  console.log(`Moving ${adminComponents.length} admin components...`);
  for (const file of adminComponents) {
    const currentPath = file.getFilePath();
    const relativePath = currentPath.split("components/admin/")[1];
    const newDir = path.dirname(`src/features/admin/components/${relativePath}`);
    file.moveToDirectory(newDir);
  }

  // 3. Move hooks/useDashboard.js to features/admin/hooks/
  const useDashboard = project.getSourceFile("src/hooks/useDashboard.js");
  if (useDashboard) {
    console.log("Moving useDashboard.js...");
    useDashboard.moveToDirectory("src/features/admin/hooks");
  }

  console.log("Saving changes...");
  await project.save();
  console.log("Done!");
}

main().catch(console.error);
