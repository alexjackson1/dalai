async function build_win32(llama) {
  // CMake on Windows
  const venv_path = path.join(llama.root.home, "venv");
  const cmake_path = path.join(venv_path, "Scripts", "cmake");
  const cache_path = path.resolve(llama.home, "build", "CMakeCache.txt");
  const build_path = path.resolve(llama.home, "build");

  await llama.root.exec("mkdir build", llama.home);
  await llama.root.exec(`Remove-Item -path ${cache_path}`, llama.home);

  let ps_counter = 0;
  const callback = (proc, data) => {
    console.log("# data", data);
    if (/^PS .*/.test(data)) {
      ps_counter++;
      if (ps_counter >= 2) {
        console.log("KILL");
        proc.kill();
      }
    }
  };
  await llama.root.exec(`${cmake_path} ..`, build_path, callback);

  ps_counter = 0;
  const release_callback = (proc, data) => {
    console.log("# data", data);
    if (/^PS .*/.test(data)) {
      ps_counter++;
      if (ps_counter >= 2) {
        console.log("KILL2");
        proc.kill();
      }
    }
  };
  const release_cmd = `${cmake_path} --build . --config Release`;
  await llama.root.exec(release_cmd, build_path, release_callback);
}

async function build_linux(llama) {
  // Make on linux + mac
  const success = await llama.root.exec(`make`, llama.home);
  if (!success) {
    throw new Error("running 'make' failed");
  }
}

module.exports = {
  build_win32,
  build_linux,
};
