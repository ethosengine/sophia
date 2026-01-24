# Sophia Editor

Content authoring UI for Sophia assessment items.

## Package Architecture

`sophia-editor` provides the editing interface for creating and modifying
assessment content that is rendered by `sophia` (main rendering) and
distributed via `sophia-element` (Web Component).

```
sophia-editor  →  (creates content for)  →  sophia  →  sophia-element
```

## Usage

This package is typically used in content management systems or authoring
tools where curriculum developers create assessment items.

Code-Owner: Learning Platform
