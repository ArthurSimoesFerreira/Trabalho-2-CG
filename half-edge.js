export class Vertex {
  constructor(vertexId, x, y, z) {
    this.vertexId = vertexId;
    this.position = [x, y, z, 1];
    this.normal = [0.0, 0.0, 0.0, 0.0];
    this.scalar = 0.0;
    this.halfEdge = null;
  }
}

export class HalfEdge {
  constructor(vertex) {
    this.vertex = vertex;
    this.next = null;
    this.face = null;
    this.opposite = null;
  }
}

export class Face {
  constructor(baseHalfEdge) {
    this.baseHalfEdge = baseHalfEdge;
  }
}

export class HalfEdgeDS {
  constructor() {
    this.vertices = [];
    this.halfEdges = [];
    this.faces = [];
  }

  isReady() {
    return this.vertices.length > 0 && this.halfEdges.length > 0 && this.faces.length > 0;
  }

  build(coords, trigs) {
    for (let vid = 0; vid < coords.length; vid += 4) {
      const x = coords[vid];
      const y = coords[vid + 1];
      const z = coords[vid + 2];
      const v = new Vertex(vid / 4, x, y, z);
      this.vertices.push(v);
    }

    for (let tid = 0; tid < trigs.length; tid += 3) {
      const v0 = this.vertices[trigs[tid + 0]];
      const v1 = this.vertices[trigs[tid + 1]];
      const v2 = this.vertices[trigs[tid + 2]];

      const he0 = new HalfEdge(v0);
      const he1 = new HalfEdge(v1);
      const he2 = new HalfEdge(v2);

      const face = new Face(he0);
      this.faces.push(face);

      he0.face = face;
      he1.face = face;
      he2.face = face;

      he0.next = he1;
      he1.next = he2;
      he2.next = he0;

      this.halfEdges.push(he0, he1, he2);
    }

    this.computeOpposites();
    this.computeVertexHalfEdge();
    this.computeNormals();
  }

  computeOpposites() {
    const visited = {};

    for (let hid = 0; hid < this.halfEdges.length; hid++) {
      const a = this.halfEdges[hid].vertex.vertexId;
      const b = this.halfEdges[hid].next.vertex.vertexId;

      const key = `k${Math.min(a, b)},${Math.max(a, b)}`;

      if (visited[key] !== undefined) {
        const op = visited[key];
        op.opposite = this.halfEdges[hid];
        this.halfEdges[hid].opposite = op;
        delete visited[key];
      } else {
        visited[key] = this.halfEdges[hid];
      }
    }
  }

  computeVertexHalfEdge() {
    for (let hid = 0; hid < this.halfEdges.length; hid++) {
      const v = this.halfEdges[hid].vertex;

      if (v.halfEdge === null) {
        v.halfEdge = this.halfEdges[hid];
      } else if (this.halfEdges[hid].opposite === null) {
        v.halfEdge = this.halfEdges[hid];
      }
    }
  }

  computeNormals() {
    for (let fId = 0; fId < this.faces.length; fId++) {
      const he0 = this.faces[fId].baseHalfEdge;
      const he1 = this.faces[fId].baseHalfEdge.next;
      const he2 = this.faces[fId].baseHalfEdge.next.next;

      const v0 = he0.vertex.position;
      const v1 = he1.vertex.position;
      const v2 = he2.vertex.position;

      const vec1 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
      const vec2 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];

      const n = [
        vec1[1] * vec2[2] - vec1[2] * vec2[1],
        vec1[2] * vec2[0] - vec1[0] * vec2[2],
        vec1[0] * vec2[1] - vec1[1] * vec2[0],
      ];

      for (let cid = 0; cid < 3; cid++) {
        he0.vertex.normal[cid] += n[cid];
        he1.vertex.normal[cid] += n[cid];
        he2.vertex.normal[cid] += n[cid];
      }
    }
  }

  getVBOs() {
    const coords = [];
    const scalars = [];
    const normals = [];
    const indices = [];

    for (let vId = 0; vId < this.vertices.length; vId++) {
      const v = this.vertices[vId];
      coords.push(...v.position);
      scalars.push(v.scalar);
      normals.push(...v.normal);
    }

    for (let hid = 0; hid < this.halfEdges.length; hid++) {
      indices.push(this.halfEdges[hid].vertex.vertexId);
    }

    return [coords, scalars, normals, indices];
  }

  changeNeighborsColor(v, color) {
    const neighbors = new Set();
    let startHE = v.halfEdge;
    let currentHE = startHE;

    do {
      const neighbor = currentHE.next.vertex;
      neighbors.add(neighbor);
      currentHE = currentHE.opposite?.next;
    } while (currentHE && currentHE !== startHE);

    neighbors.forEach((neighbor) => {
      neighbor.color = color;
    });
  }
}