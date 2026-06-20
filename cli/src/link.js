import { spawn } from "node:child_process";
import { join } from "node:path";

export function link(harnessDir) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn("bash", [join(harnessDir, "setup.sh")], { stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0
        ? resolvePromise()
        : reject(new Error(`setup.sh a échoué (code ${code})`)),
    );
  });
}
