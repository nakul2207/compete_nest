export const LANGUAGE_VERSIONS = {
    cpp: {
        id: 76,
        version: "GCC 14.1.0"
    },
    java: {
        id: 91,
        version: "JDK 17.0.6"
    },
    python: {
        id: 100,
        version: "3.12.5"
    },
    c: {
        id: 104,
        version: "Clang 18.1.8"
    },
    javascript: {
        id: 102,
        version: "Node.js 22.08.0"
    },
    rust: {
        id: 73,
        version: "1.40.0"
    }
};

export const CODE_SNIPPETS = {
    javascript: `\nfunction greet(name) {\n\tconsole.log("Hello, " + name + "!");\n}\n\ngreet("Alex");\n`,
    python: `\ndef greet(name):\n\tprint("Hello, " + name + "!")\n\ngreet("Alex")\n`,
    java: `\npublic class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t}\n}\n`,
    cpp: `\n#include <iostream>\n\nint main() {\n\tstd::cout << "Hello, World!" << std::endl;\n\treturn 0;\n}\n`, // C++ snippet
    rust: `fn main() {\n\tprintln!("Hello, World!");\n}`, // Rust snippet
    c: `#include <stdio.h>\n\nint main() {\n\tprintf("Hello, World!\\n");\n\treturn 0;\n}\n` // C snippet
};
