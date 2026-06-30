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

  const targetProfile = path.resolve(__dirname, "src/features/profile");
  const targetProfileComponents = path.resolve(__dirname, "src/features/profile/components");

  const profilePage = project.getSourceFile("src/pages/Profile.jsx");
  if (profilePage) {
    console.log("Moving Profile.jsx...");
    profilePage.moveToDirectory(targetProfile);
  }

  const profileComponents = project.getSourceFiles("src/components/profile/**/*");
  console.log(`Moving ${profileComponents.length} profile components...`);
  for (const file of profileComponents) {
    const currentPath = file.getFilePath();
    const relativePath = currentPath.split("components/profile/")[1];
    const newDir = path.dirname(path.resolve(__dirname, `src/features/profile/components/${relativePath}`));
    file.moveToDirectory(newDir);
  }

  await project.save();
  console.log("Done!");
}
main().catch(console.error);
