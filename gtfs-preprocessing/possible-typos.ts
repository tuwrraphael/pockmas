let possibleTyposDef: { [letter: string]: string } = {};
possibleTyposDef["a"] = "qsw";
possibleTyposDef["b"] = "vnhj";
possibleTyposDef["c"] = "xgvf";
possibleTyposDef["d"] = "esyfsxr";
possibleTyposDef["e"] = "wdr32s";
possibleTyposDef["f"] = "dxrgct";
possibleTyposDef["g"] = "fchtvz";
possibleTyposDef["h"] = "gzjvbu";
possibleTyposDef["i"] = "78ukoj";
possibleTyposDef["j"] = "hubkni";
possibleTyposDef["k"] = "jlniom";
possibleTyposDef["l"] = "kmop";
possibleTyposDef["m"] = "nlk";
possibleTyposDef["n"] = "bkmj";
possibleTyposDef["o"] = "ilp8k";
possibleTyposDef["p"] = "9ol";
possibleTyposDef["r"] = "34etfd";
possibleTyposDef["s"] = "weayd";
possibleTyposDef["t"] = "45rzgf";
possibleTyposDef["u"] = "67zijh";
possibleTyposDef["v"] = "chbg";
possibleTyposDef["w"] = "2qsea";
possibleTyposDef["x"] = "yfcd";
possibleTyposDef["y"] = "dxs"
possibleTyposDef["z"] = "thu56g";

export const possibleTypos = Object.fromEntries(Object.keys(possibleTyposDef).map(key => ([key, possibleTyposDef[key].split("")])));