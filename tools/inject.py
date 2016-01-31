
import argparse
import re
import os

parser = argparse.ArgumentParser()
parser.add_argument("-i", "--input")
parser.add_argument("-o", "--output")
args = parser.parse_args()

include_re = re.compile("(.*)@include{([^}]*)}(.*)")
inclayr_re = re.compile("(.*)@include-layer{([^}]*)}(.*)")

def process(inpath, outf):
    with open(inpath, "rb") as inf:
        for line in inf:
            match = include_re.match(line)
            def recurse(relpath):
                datapath = os.path.abspath(os.path.join(os.path.dirname(inpath), relpath))
                process(datapath, outf)
                
            if match:
                outf.write(match.group(1))
                recurse(match.group(2))
                outf.write(match.group(3))
            else:
                match = inclayr_re.match(line)
                if match:
                    relpath = match.group(2)
                    parts = relpath.split("/");
                    layer_id = parts[len(parts)-1].replace(".dat", "")
                    outf.write(match.group(1))
                    outf.write("""<div id="%s" class="data-container">""" % layer_id)
                    recurse(relpath)
                    outf.write("""</div>""")
                    outf.write("""<script>register_layer("%s");</script>""" % layer_id)
                    outf.write(match.group(3))
                else:
                    outf.write(line)


if __name__ == "__main__":
    with open(os.path.abspath(args.output), "wb") as outf:
        process(os.path.abspath(args.input), outf)
