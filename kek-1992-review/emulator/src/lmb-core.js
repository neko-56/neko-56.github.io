(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.LMBCore = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  function decodeEntities(s) {
    return s
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'");
  }

  function parseAttrs(src) {
    const attrs = {};
    const re = /([A-Za-z_:][-A-Za-z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    let m;
    while ((m = re.exec(src))) attrs[m[1].toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? "");
    return attrs;
  }

  function parseHTMLSubset(html) {
    const root = { type: "element", tag: "root", attrs: {}, children: [] };
    const stack = [root];
    const voidTags = new Set(["br", "hr", "img", "meta", "link", "input"]);
    const blockAutoClose = new Set(["dt", "dd", "li", "p"]);
    const tokenRe = /<!--[\s\S]*?-->|<\/?[A-Za-z][^>]*>|[^<]+/g;
    let token;

    while ((token = tokenRe.exec(html))) {
      const t = token[0];
      if (t.startsWith("<!--")) continue;
      if (t[0] !== "<") {
        stack[stack.length - 1].children.push({ type: "text", text: decodeEntities(t) });
        continue;
      }

      const isEnd = /^<\//.test(t);
      const nameMatch = t.match(/^<\/?\s*([A-Za-z0-9]+)/);
      if (!nameMatch) continue;
      const tag = nameMatch[1].toLowerCase();

      if (isEnd) {
        for (let i = stack.length - 1; i > 0; i--) {
          if (stack[i].tag === tag) { stack.length = i; break; }
        }
        continue;
      }

      if (blockAutoClose.has(tag) && stack.length > 1 && stack[stack.length - 1].tag === tag) stack.pop();
      if ((tag === "dt" || tag === "dd") && stack.length > 1 &&
          (stack[stack.length - 1].tag === "dt" || stack[stack.length - 1].tag === "dd")) stack.pop();

      const rawAttrs = t.replace(/^<\s*[A-Za-z0-9]+/, "").replace(/\/?\s*>$/, "");
      const node = { type: "element", tag, attrs: parseAttrs(rawAttrs), children: [] };
      stack[stack.length - 1].children.push(node);
      if (!voidTags.has(tag) && !/\/>$/.test(t)) stack.push(node);
    }
    return root;
  }

  function findFirstTag(node, tag) {
    if (!node || node.type !== "element") return null;
    if (node.tag === tag) return node;
    for (const child of node.children || []) {
      const found = findFirstTag(child, tag);
      if (found) return found;
    }
    return null;
  }

  function collapseWhitespace(s) { return s.replace(/\s+/g, " ").trim(); }
  function cleanPunctuation(s) {
    return s.replace(/\s+([,.;:!?])/g, "$1")
      .replace(/\(\s+/g, "(")
      .replace(/\s+\)/g, ")")
      .replace(/\s+\]/g, "]");
  }
  function collectPlain(node) {
    if (!node) return "";
    if (node.type === "text") return node.text;
    return (node.children || []).map(collectPlain).join("");
  }

  function makeContext(width) {
    return {
      width,
      links: [],
      nextRef: 1,
      referenceMark: n => "[" + n + "]",
      endMark: "[End]"
    };
  }

  const BEHAVIOR_PROFILES = Object.freeze({
    sep1992_conservative: Object.freeze({
      id: "sep1992_conservative",
      label: "1992-09-30 conservative",
      promptStyle: "period_1992_feb",
      interactiveSourcePrefix: false,
      promptEvidence: Object.freeze({
        referenceRange: "direct_1992_02",
        returnForMore: "direct_1992_02",
        helpOrQuit: "direct_1992_02",
        find: "omit_unattested_sep30_wording",
        back: "omit_unattested_sep30_wording",
        up: "omit_unattested_sep30_wording"
      }),
      formatter: Object.freeze({
        headingUppercase: true,
        headingCenter: false,
        headingIndent: 1
      })
    }),
    nov1992_documented: Object.freeze({
      id: "nov1992_documented",
      label: "1992-11-03 documented command model",
      promptStyle: "nov1992_reference",
      interactiveSourcePrefix: true,
      promptEvidence: Object.freeze({
        find: "documented_1992_11_reference",
        back: "documented_reference_mode",
        up: "documented_reference_mode",
        returnForMore: "documented_reference_mode"
      }),
      formatter: Object.freeze({
        headingUppercase: true,
        headingCenter: false,
        headingIndent: 1
      })
    })
  });

  function behaviorProfile(id) {
    return BEHAVIOR_PROFILES[id] || BEHAVIOR_PROFILES.sep1992_conservative;
  }

  function inlineText(node, ctx) {
    if (!node) return "";
    if (node.type === "text") return node.text;
    if (node.tag === "br") return "\n";
    if (node.tag === "img") return ""; // text-only browser: image body has no inline bitmap display
    if (node.tag === "a") {
      const raw = (node.children || []).map(n => inlineText(n, ctx)).join("");
      const leading = /^\s/.test(raw) ? " " : "";
      const trailing = /\s$/.test(raw) ? " " : "";
      const label = collapseWhitespace(raw);
      const ref = ctx.nextRef++;
      ctx.links.push({ number: ref, href: node.attrs.href || "", label: cleanPunctuation(label) });
      return leading + label + ctx.referenceMark(ref) + trailing;
    }
    // Historic LMB behavior was forgiving: unknown markup is stripped, contents remain.
    return (node.children || []).map(n => inlineText(n, ctx)).join("");
  }

  function wrapWords(text, width, firstIndent, restIndent) {
    firstIndent = firstIndent || "";
    restIndent = restIndent === undefined ? firstIndent : restIndent;
    text = cleanPunctuation(collapseWhitespace(text));
    if (!text) return [];

    const words = text.split(" ");
    const lines = [];
    let prefix = firstIndent;
    let line = prefix;

    for (const word of words) {
      const sep = line.length > prefix.length ? " " : "";
      if ((line + sep + word).length <= width) {
        line += sep + word;
      } else {
        if (line.length > prefix.length) lines.push(line);
        prefix = restIndent;
        if ((prefix + word).length <= width) line = prefix + word;
        else {
          let remain = word;
          while (remain.length > Math.max(1, width - prefix.length)) {
            const take = Math.max(1, width - prefix.length);
            lines.push(prefix + remain.slice(0, take));
            remain = remain.slice(take);
            prefix = restIndent;
          }
          line = prefix + remain;
        }
      }
    }
    if (line.length > prefix.length) lines.push(line);
    return lines;
  }

  function appendBlank(lines) {
    if (lines.length && lines[lines.length - 1] !== "") lines.push("");
  }
  function rightAlign(text, width) {
    text = collapseWhitespace(text);
    if (text.length >= width) return text.slice(0, width);
    return " ".repeat(width - text.length) + text;
  }
  function center(text, width) {
    if (text.length >= width) return text.slice(0, width);
    return " ".repeat(Math.floor((width - text.length) / 2)) + text;
  }

  function renderDL(node, ctx, lines, options) {
    const indent = options.definitionIndent || 24;
    let currentTerm = null;

    function renderPair(termNode, ddNode) {
      const term = termNode ? cleanPunctuation(collapseWhitespace(inlineText(termNode, ctx))) : "";
      const desc = ddNode ? cleanPunctuation(collapseWhitespace(inlineText(ddNode, ctx))) : "";
      const indentText = " ".repeat(indent);

      if (!desc) {
        if (term) lines.push(...wrapWords(term, ctx.width, "", ""));
        if (options.definitionGap) appendBlank(lines);
        return;
      }
      const descWidth = Math.max(8, ctx.width - indent);
      const descWrapped = wrapWords(desc, descWidth, "", "");
      if (term.length < indent && descWrapped.length) {
        lines.push(term.padEnd(indent, " ") + descWrapped[0]);
        for (let i = 1; i < descWrapped.length; i++) lines.push(indentText + descWrapped[i]);
      } else {
        if (term) lines.push(...wrapWords(term, ctx.width, "", ""));
        for (const d of descWrapped) lines.push(indentText + d);
      }
      if (options.definitionGap) appendBlank(lines);
    }

    for (const child of node.children || []) {
      if (child.type !== "element") continue;
      if (child.tag === "dt") {
        if (currentTerm) renderPair(currentTerm, null);
        currentTerm = child;
      } else if (child.tag === "dd") {
        renderPair(currentTerm, child);
        currentTerm = null;
      }
    }
    if (currentTerm) renderPair(currentTerm, null);
  }

  function renderList(node, ctx, lines, options, ordered) {
    let ordinal = 1;
    for (const child of node.children || []) {
      if (child.type !== "element" || child.tag !== "li") continue;
      const marker = ordered ? String(ordinal++) + ". " : " o ";
      const continuation = " ".repeat(marker.length);
      const item = inlineText(child, ctx);
      lines.push(...wrapWords(item, options.width, marker, continuation));
    }
    appendBlank(lines);
  }

  function renderChildren(children, ctx, lines, options) {
    for (const node of children || []) {
      if (node.type === "text") {
        const t = cleanPunctuation(collapseWhitespace(node.text));
        if (t) { lines.push(...wrapWords(t, ctx.width, "", "")); appendBlank(lines); }
        continue;
      }
      if (node.tag === "head" || node.tag === "title") continue;

      switch (node.tag) {
        case "h1": case "h2": case "h3": {
          appendBlank(lines);
          let title = cleanPunctuation(collapseWhitespace(inlineText(node, ctx)));
          if (options.headingUppercase) title = title.toUpperCase();
          if (options.headingCenter) {
            lines.push(center(title, options.width));
          } else {
            const indent = " ".repeat(Math.max(0, options.headingIndent || 0));
            lines.push((indent + title).slice(0, options.width));
          }
          appendBlank(lines);
          break;
        }
        case "p":
          lines.push(...wrapWords(inlineText(node, ctx), options.width, "", "")); appendBlank(lines); break;
        case "pre": {
          const raw = collectPlain(node).replace(/\r/g, "");
          for (const ln of raw.split("\n")) lines.push(ln.slice(0, options.width));
          appendBlank(lines); break;
        }
        case "dl": renderDL(node, ctx, lines, options); break;
        case "ul": renderList(node, ctx, lines, options, false); break;
        case "ol": renderList(node, ctx, lines, options, true); break;
        case "hr": lines.push("-".repeat(options.width)); break;
        case "html": case "body":
          renderChildren(node.children, ctx, lines, options); break;
        default: {
          const t = cleanPunctuation(collapseWhitespace(inlineText(node, ctx)));
          if (t) { lines.push(...wrapWords(t, options.width, "", "")); appendBlank(lines); }
        }
      }
    }
  }

  function formatDocument(html, options) {
    options = Object.assign({
      width: 80,
      headingUppercase: true,
      headingCenter: false,
      headingIndent: 1,
      definitionIndent: 24,
      definitionGap: true,
      endIndent: 3,
      showDocumentTitle: false
    }, options || {});

    const ast = parseHTMLSubset(html);
    const ctx = makeContext(options.width);
    const lines = [];
    const titleNode = findFirstTag(ast, "title");
    const bodyNode = findFirstTag(ast, "body");
    const documentTitle = titleNode ? cleanPunctuation(collapseWhitespace(collectPlain(titleNode))) : "";

    if (options.showDocumentTitle && documentTitle) lines.push(rightAlign(documentTitle, options.width));
    renderChildren(bodyNode ? bodyNode.children : ast.children, ctx, lines, options);

    while (lines.length && lines[lines.length - 1] === "") lines.pop();
    lines.push(" ".repeat(options.endIndent) + ctx.endMark);
    return { lines, links: ctx.links, ast, documentTitle };
  }

  function commandFor(input) {
    const raw = input;
    const s = input.trim();
    const low = s.toLowerCase();
    if (!s) return { name: "return" };
    if (/^\d+$/.test(s)) return { name: "number", number: Number(s) };

    let m;
    if ((m = low.match(/^(?:recall|recal|reca|rec|re|r)\s+(\d+)$/))) return { name: "recall-number", number: Number(m[1]) };
    if ((m = s.match(/^(?:go|g)\s+(.+)$/i))) return { name: "go", target: m[1] };
    if ((m = s.match(/^(?:find|f)\s+(.+)$/i))) return { name: "find", query: m[1] };
    if ((m = s.match(/^source(?:\s+(.*))?$/i))) return { name: "source", command: m[1] || "" };

    const map = [
      ["help", "help"], ["back", "back"], ["home", "home"], ["up", "up"], ["down", "down"],
      ["top", "top"], ["bottom", "bottom"], ["list", "list"], ["recall", "recall"],
      ["next", "next"], ["previous", "previous"], ["manual", "manual"], ["verbose", "verbose"], ["quit", "quit"]
    ];
    for (const [word, name] of map) {
      if (word.startsWith(low) && low.length >= 1) return { name };
    }
    return { name: "unknown", raw };
  }

  function htmlEscape(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function syntheticDocument(title, bodyLines) {
    return "<HTML><HEAD><TITLE>" + htmlEscape(title) + "</TITLE></HEAD><BODY><H1>" + htmlEscape(title) + "</H1>\n" +
      bodyLines.map(x => "<P>" + htmlEscape(x) + "</P>").join("\n") + "</BODY></HTML>";
  }

  class Engine {
    constructor(homeHTML, options) {
      const supplied = options || {};
      const mode = supplied.behaviorMode || "sep1992_conservative";
      const behavior = behaviorProfile(mode);
      this.options = Object.assign({ width: 80, rows: 24, formatter: {}, isIndex: false, behaviorMode: mode }, supplied);
      this.options.behaviorMode = mode;
      this.options.formatter = Object.assign({}, behavior.formatter, supplied.formatter || {});
      this.behavior = behavior;
      this.homeHTML = homeHTML;
      this.current = null;
      this.history = [];
      this.recall = [];
      this.topLine = 0;
      this.halted = false;
      this.message = "";
      this.verbose = false;
      this.branchContext = null;
      this.pendingNavigation = null;
      this.resolveDocument = typeof supplied.resolveDocument === "function" ? supplied.resolveDocument : null;
      this.loadDocument("KEK Information", homeHTML, "ftp://kekux.kek.jp/kek/html/kek.html", false, null);
    }

    get contentRows() { return Math.max(1, this.options.rows - 1); }
    snapshot() {
      return { title: this.current.title, html: this.current.html, address: this.current.address,
        topLine: this.topLine, branchContext: this.branchContext, isIndex: !!this.current.isIndex };
    }
    loadDocument(title, html, address, pushHistory, branchContext, isIndex) {
      if (pushHistory && this.current) this.history.push(this.snapshot());
      const formatted = formatDocument(html, Object.assign({ width: this.options.width }, this.options.formatter));
      this.current = { title, html, address, formatted, isIndex: !!isIndex };
      this.branchContext = branchContext || null;
      this.recall.push({ title, html, address, isIndex: !!isIndex });
      this.topLine = 0;
      this.message = "";
      this.pendingNavigation = null;
      this.halted = false;
    }
    restore(snap) {
      const formatted = formatDocument(snap.html, Object.assign({ width: this.options.width }, this.options.formatter));
      this.current = { title: snap.title, html: snap.html, address: snap.address, formatted, isIndex: !!snap.isIndex };
      this.topLine = snap.topLine || 0;
      this.branchContext = snap.branchContext || null;
      this.message = "";
      this.pendingNavigation = null;
      this.halted = false;
    }
    canDown() { return this.topLine + this.contentRows < this.current.formatted.lines.length; }
    canUp() { return this.topLine > 0; }

    prompt() {
      if (this.halted) return "";
      const n = this.current.formatted.links.length;

      if (this.behavior.promptStyle === "period_1992_feb") {
        // Conservative September profile: render only prompt tokens directly
        // attested by the 1992-02-18 terminal-client figure. Back/Up/Find may
        // have existed in the September executable, but their exact prompt
        // wording/conditions are not yet established, so they are deliberately
        // not advertised here. The commands remain independently testable.
        const parts = [];
        if (n) parts.push(n === 1 ? "1" : "1-" + n);
        if (this.canDown()) parts.push("Return for more");
        return (parts.length ? parts.join(", ") + ", " : "") + "Help or Quit:";
      }

      const parts = [];
      if (this.current.isIndex) parts.push("FIND <keywords>");
      if (n) parts.push(n === 1 ? "1" : "1-" + n);
      if (this.history.length) parts.push("Back");
      if (this.canUp()) parts.push("Up");
      if (this.canDown()) parts.push("<RETURN> for more");
      parts.push("Quit");
      if (parts.length === 1) return parts[0] + ", or Help:";
      return parts.join(", ") + ", or Help:";
    }

    screen(inputBuffer) {
      const out = new Array(this.options.rows).fill("");
      if (this.halted) { out[0] = "WWW Line Mode Browser session ended."; return out; }
      const visible = this.current.formatted.lines.slice(this.topLine, this.topLine + this.contentRows);
      for (let i = 0; i < visible.length && i < this.contentRows; i++) out[i] = visible[i];
      if (this.message) {
        let row = Math.min(this.contentRows - 1, Math.max(0, visible.length));
        out[row] = this.message.slice(0, this.options.width);
      }
      out[this.options.rows - 1] = (this.prompt() + (inputBuffer || "")).slice(0, this.options.width);
      return out;
    }

    resolvedDocument(target, context) {
      if (!this.resolveDocument) return null;
      const resolved = this.resolveDocument(target, context || {});
      if (!resolved || typeof resolved.html !== "string") return null;
      return {
        title: resolved.title || target,
        html: resolved.html,
        address: resolved.address || target,
        isIndex: !!resolved.isIndex
      };
    }

    recordPendingNavigation(kind, target, details) {
      this.pendingNavigation = Object.assign({
        kind,
        target: target || "",
        from: this.current ? this.current.address : ""
      }, details || {});
    }

    followReference(number, pushHistory) {
      const link = this.current.formatted.links.find(x => x.number === number);
      if (!link) { this.message = "No such reference."; return; }
      const parent = this.snapshot();
      const branch = { parent, links: this.current.formatted.links.map(x => ({...x})), selectedNumber: number };
      const resolved = this.resolvedDocument(link.href, {
        kind: "reference", number, label: link.label, parentAddress: this.current.address
      });
      if (!resolved) {
        // Do not invent modern offline/error prose inside the historical framebuffer.
        // The embedding UI may expose this unresolved request outside the framebuffer.
        this.recordPendingNavigation("reference", link.href, { number, label: link.label || "" });
        return;
      }
      this.loadDocument(resolved.title, resolved.html, resolved.address, pushHistory, branch, resolved.isIndex);
    }

    followSibling(delta) {
      const b = this.branchContext;
      if (!b || !b.links || !b.links.length) { this.message = "Next/Previous is not applicable."; return; }
      const idx = b.links.findIndex(x => x.number === b.selectedNumber);
      const nextIdx = idx + delta;
      if (nextIdx < 0 || nextIdx >= b.links.length) { this.message = delta > 0 ? "No next document." : "No previous document."; return; }
      const link = b.links[nextIdx];
      const resolved = this.resolvedDocument(link.href, {
        kind: delta > 0 ? "next" : "previous",
        number: link.number,
        label: link.label,
        parentAddress: b.parent && b.parent.address ? b.parent.address : ""
      });
      if (!resolved) {
        this.recordPendingNavigation(delta > 0 ? "next" : "previous", link.href, { number: link.number, label: link.label || "" });
        return;
      }
      this.current = {
        title: resolved.title, html: resolved.html, address: resolved.address,
        formatted: formatDocument(resolved.html, Object.assign({width:this.options.width}, this.options.formatter)),
        isIndex: resolved.isIndex
      };
      this.branchContext = { parent: b.parent, links: b.links, selectedNumber: link.number };
      this.recall.push({ title: resolved.title, html: resolved.html, address: resolved.address, isIndex: resolved.isIndex });
      this.topLine = 0;
      this.message = "";
      this.pendingNavigation = null;
    }

    execute(input) {
      if (this.halted) return;
      const c = commandFor(input);
      this.message = "";
      this.pendingNavigation = null;
      switch (c.name) {
        case "return": case "down":
          if (this.canDown()) this.topLine += this.contentRows; else this.message = "[End]"; break;
        case "up":
          if (this.canUp()) this.topLine = Math.max(0, this.topLine - this.contentRows); else this.message = "[Top]"; break;
        case "top": this.topLine = 0; break;
        case "bottom": this.topLine = Math.max(0, this.current.formatted.lines.length - this.contentRows); break;
        case "number": this.followReference(c.number, true); break;
        case "next": this.followSibling(1); break;
        case "previous": this.followSibling(-1); break;
        case "back":
          if (!this.history.length) this.message = "No previous document.";
          else this.restore(this.history.pop());
          break;
        case "home": this.loadDocument("KEK Information", this.homeHTML, "ftp://kekux.kek.jp/kek/html/kek.html", true, null, false); break;
        case "help": case "manual": {
          // Keep research-mode labels out of the historical framebuffer.  This is a
          // compact reconstruction of period help concepts, not a verbatim copy of
          // the preserved help page.
          const page = syntheticDocument("WWW LINE MODE BROWSER", [
            "References are shown as numbers in square brackets.",
            "Type a reference number and RETURN to follow it.",
            "RETURN alone displays more of the current document.",
            "Type HELP for help or QUIT to end the session."
          ]);
          this.loadDocument("Help", page, "internal:help", true, null, false); break;
        }
        case "list": {
          const body = this.current.formatted.links.length ? this.current.formatted.links.map(l => l.number + ". " + l.label + " -- " + l.href) : ["There are no references in this document."];
          this.loadDocument("REFERENCES", syntheticDocument("REFERENCES", body), "internal:list", true, null, false); break;
        }
        case "recall": {
          const body = this.recall.map((x,i) => (i+1) + ". " + x.title + " -- " + x.address);
          this.loadDocument("RECALL", syntheticDocument("RECALL", body.length ? body : ["No documents recalled."]), "internal:recall", true, null, false); break;
        }
        case "recall-number": {
          const x = this.recall[c.number - 1];
          if (!x) this.message = "No such recalled document.";
          else this.loadDocument(x.title, x.html, x.address, true, null, x.isIndex);
          break;
        }
        case "go": {
          const resolved = this.resolvedDocument(c.target, { kind: "go", parentAddress: this.current.address });
          if (resolved) this.loadDocument(resolved.title, resolved.html, resolved.address, true, null, resolved.isIndex);
          else this.recordPendingNavigation("go", c.target);
          break;
        }
        case "find":
          if (!this.current.isIndex) this.message = "Find is not applicable to this document.";
          else this.recordPendingNavigation("find", this.current.address, { query: c.query });
          break;
        case "source":
          // Historical documentation distinguishes the command-line -source option
          // (v1.2a+) from the interactive SOURCE prefix (v1.3+). SOURCE by itself
          // explicitly does not redisplay the current document as source.
          if (!this.behavior.interactiveSourcePrefix) {
            this.message = "? Unknown command";
          } else if (!c.command.trim()) {
            // Documented no-op: SOURCE must qualify another command.
          } else {
            // Preserve the documented prefix semantics without fabricating remote
            // source bytes. The unresolved operation is reported outside the
            // historical framebuffer by the embedding research UI.
            this.recordPendingNavigation("source", this.current.address, { command: c.command.trim() });
          }
          break;
        case "verbose": this.verbose = !this.verbose; this.message = "Verbose mode " + (this.verbose ? "on." : "off."); break;
        case "quit": this.halted = true; break;
        default: this.message = "? Unknown command";
      }
    }
  }

  return { parseHTMLSubset, formatDocument, commandFor, behaviorProfile, BEHAVIOR_PROFILES, Engine };
});
