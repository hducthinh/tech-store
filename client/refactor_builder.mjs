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

  const targetBuilder = path.resolve(__dirname, "src/features/builder");
  const targetBuilderUtils = path.resolve(__dirname, "src/features/builder/utils");

  const pcBuilder = project.getSourceFile("src/pages/PCBuilder.jsx");
  if (pcBuilder) {
    console.log("Moving PCBuilder.jsx...");
    pcBuilder.moveToDirectory(targetBuilder);
  }

  const compatibility = project.getSourceFile("src/utils/compatibility.js");
  if (compatibility) {
    console.log("Moving compatibility.js...");
    compatibility.moveToDirectory(targetBuilderUtils);
  }

  await project.save();
  console.log("Done!");
}
main().catch(console.error);
