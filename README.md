# Absal

An optimal evaluator for the λ-calculus. Absal works by compiling terms to
([symmetric](https://scholar.google.com.br/scholar?q=symmetric+interaction+combinators&hl=en&as_sdt=0&as_vis=1&oi=scholart&sa=X&ved=0ahUKEwjNgZbO7aTVAhUEkZAKHYyTAFgQgQMIJjAA))
[interaction
combinators](http://www.sciencedirect.com/science/article/pii/S0890540197926432).

It **asymptotically** beats all usual evaluators of functional programs,
including Scheme Chez, Haskell GHC, JavaScript V8 and so on, which means it can
be millions of times faster in some cases, as explained on [this
article](https://medium.com/@maiavictor/solving-the-mystery-behind-abstract-algorithms-magical-optimizations-144225164b07).

It is similar to other optimal evaluators, except that it doesn't include any
book-keeping machinery ("oracle"), only the "elegant core". Because of that, the
implementation is very small, around 250 lines of code, including parsers.

Sadly, this algorithm isn't complete: it is incapable of evaluating λ-terms that
copy a copy of themselves (like `(λx.(x x) λf.λx.(f (f x)))`). While this is
very rare in practice, making Absal compatible with the entire λ-calculus is an
important open problem.

![combinator_rules](images/combinators_rules.png)

## Usage

- Install

    ```bash
    npm install -g abstract-algorithm
    ```

- Use as a command

    ```bash
    absal "(λf.λx.(f (f x)) λf.λx.(f (f x)))"

    # or...

    absal <file_name>
    ```

- Use as a lib

    ```javascript
    const Absal = require("absal");

    // Parses a λ-term
    var term = Absal.core.read("(λf.λx.(f (f x)) λf.λx.(f (f x)))");

    // Compiles to interaction combinators net
    var inet = Absal.inet.read(Absal.comp.compile(term));

    // Reduces the net
    var rewrites = Absal.inet.reduce(inet);

    // Decompiles back to a λ-term
    var term = Absal.comp.decompile(inet);

    // Prints the result
    console.log(Absal.core.show(term));
    console.log("("+rewrites+" rewrites)");
    ```

- Work with interaction combinators directly

    ```javascript
    const Absal = require("absal");

    // Creates an interaction combinator net with 4 nodes
    var inet = Absal.inet.read(`
    - a b a
    - c d b
    - c e e
    - d f f
    `);

    // Reduces the net
    var rewrites = Absal.inet.reduce(inet);

    // Prints the result
    console.log(Absal.inet.show(inet));
    console.log("("+rewrites+" rewrites)");
    ```

## Some drawings

- [Numbers](images/handwritten_example.jpg?raw=true)

- [Pairs](images/pairs_on_inets.jpg?raw=true)

- [Either](images/either_on_inets.jpg?raw=true)

# Stuff

- [This](https://github.com/MaiaVictor/abstract-algorithm/blob/old_repo/examples/lambda-calculus.js)

- [This](https://github.com/MaiaVictor/parallel_lambda_computer_tests)

- [Formality](https://github.com/moonad/formality)
