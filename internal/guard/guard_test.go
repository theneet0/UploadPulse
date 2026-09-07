package guard

import (
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// TestStrictNoDownloadTestASTGuard statically inspects the codebase using the Go AST parser
// to guarantee that no download-speed test functions are EVER invoked anywhere in the project.
func TestStrictNoDownloadTestASTGuard(t *testing.T) {
	// Root directory of repository
	root := "../.."

	forbiddenCalls := []string{
		"DownloadTest",
		"DownloadTestContext",
		"MultiDownloadTestContext",
		"downloadRequest",
		"DownloadHandler",
	}

	err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Skip vendor, node_modules, .git, and the speedtest-go library itself (which defines library functions)
		if info.IsDir() {
			name := info.Name()
			if name == "node_modules" || name == ".git" || name == "dist" || name == "pkg" || name == "guard" {
				return filepath.SkipDir
			}
			return nil
		}

		if !strings.HasSuffix(path, ".go") {
			return nil
		}

		fset := token.NewFileSet()
		node, parseErr := parser.ParseFile(fset, path, nil, parser.AllErrors)
		if parseErr != nil {
			t.Fatalf("failed to parse Go file %s: %v", path, parseErr)
		}

		ast.Inspect(node, func(n ast.Node) bool {
			call, ok := n.(*ast.CallExpr)
			if !ok {
				return true
			}

			var funcName string
			switch fn := call.Fun.(type) {
			case *ast.Ident:
				funcName = fn.Name
			case *ast.SelectorExpr:
				funcName = fn.Sel.Name
			}

			for _, forbidden := range forbiddenCalls {
				if funcName == forbidden {
					pos := fset.Position(call.Pos())
					t.Errorf("FORBIDDEN DOWNLOAD TEST CALL DETECTED: %s called at %s", funcName, pos)
				}
			}

			return true
		})

		return nil
	})

	if err != nil {
		t.Fatalf("error walking directory: %v", err)
	}
}
