export namespace kube {
	
	export class BinaryDataKey {
	    name: string;
	    size: number;
	
	    static createFrom(source: any = {}) {
	        return new BinaryDataKey(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.size = source["size"];
	    }
	}
	export class ClusterHealth {
	    connected: boolean;
	    latencyMs: number;
	    serverVersion: string;
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new ClusterHealth(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.connected = source["connected"];
	        this.latencyMs = source["latencyMs"];
	        this.serverVersion = source["serverVersion"];
	        this.error = source["error"];
	    }
	}
	export class ConfigMapDetail {
	    name: string;
	    namespace: string;
	    uid: string;
	    creationTimestamp: string;
	    labels: Record<string, string>;
	    annotations: Record<string, string>;
	    data: Record<string, string>;
	    binaryDataKeys: BinaryDataKey[];
	    age: string;
	
	    static createFrom(source: any = {}) {
	        return new ConfigMapDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.uid = source["uid"];
	        this.creationTimestamp = source["creationTimestamp"];
	        this.labels = source["labels"];
	        this.annotations = source["annotations"];
	        this.data = source["data"];
	        this.binaryDataKeys = this.convertValues(source["binaryDataKeys"], BinaryDataKey);
	        this.age = source["age"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ConfigMapInfo {
	    name: string;
	    namespace: string;
	    dataCount: number;
	    age: string;
	
	    static createFrom(source: any = {}) {
	        return new ConfigMapInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.dataCount = source["dataCount"];
	        this.age = source["age"];
	    }
	}
	export class VolumeMount {
	    name: string;
	    mountPath: string;
	    readOnly: boolean;
	
	    static createFrom(source: any = {}) {
	        return new VolumeMount(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.mountPath = source["mountPath"];
	        this.readOnly = source["readOnly"];
	    }
	}
	export class ContainerResource {
	    cpuRequest: string;
	    cpuLimit: string;
	    memoryRequest: string;
	    memoryLimit: string;
	
	    static createFrom(source: any = {}) {
	        return new ContainerResource(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.cpuRequest = source["cpuRequest"];
	        this.cpuLimit = source["cpuLimit"];
	        this.memoryRequest = source["memoryRequest"];
	        this.memoryLimit = source["memoryLimit"];
	    }
	}
	export class ContainerPort {
	    name: string;
	    containerPort: number;
	    protocol: string;
	
	    static createFrom(source: any = {}) {
	        return new ContainerPort(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.containerPort = source["containerPort"];
	        this.protocol = source["protocol"];
	    }
	}
	export class ContainerDetail {
	    name: string;
	    image: string;
	    ready: boolean;
	    state: string;
	    stateDetail: string;
	    restartCount: number;
	    ports: ContainerPort[];
	    resources: ContainerResource;
	    volumeMounts: VolumeMount[];
	
	    static createFrom(source: any = {}) {
	        return new ContainerDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.image = source["image"];
	        this.ready = source["ready"];
	        this.state = source["state"];
	        this.stateDetail = source["stateDetail"];
	        this.restartCount = source["restartCount"];
	        this.ports = this.convertValues(source["ports"], ContainerPort);
	        this.resources = this.convertValues(source["resources"], ContainerResource);
	        this.volumeMounts = this.convertValues(source["volumeMounts"], VolumeMount);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ContainerInfo {
	    name: string;
	    image: string;
	    ready: boolean;
	    state: string;
	
	    static createFrom(source: any = {}) {
	        return new ContainerInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.image = source["image"];
	        this.ready = source["ready"];
	        this.state = source["state"];
	    }
	}
	
	
	export class Context {
	    name: string;
	    cluster: string;
	    user: string;
	
	    static createFrom(source: any = {}) {
	        return new Context(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.cluster = source["cluster"];
	        this.user = source["user"];
	    }
	}
	export class CronJobDetail {
	    name: string;
	    namespace: string;
	    uid: string;
	    creationTimestamp: string;
	    labels: Record<string, string>;
	    annotations: Record<string, string>;
	    schedule: string;
	    suspend: boolean;
	    active: number;
	    lastSchedule: string;
	    age: string;
	    concurrencyPolicy: string;
	    successfulJobsHistoryLimit?: number;
	    failedJobsHistoryLimit?: number;
	    startingDeadlineSeconds?: number;
	    images: string[];
	
	    static createFrom(source: any = {}) {
	        return new CronJobDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.uid = source["uid"];
	        this.creationTimestamp = source["creationTimestamp"];
	        this.labels = source["labels"];
	        this.annotations = source["annotations"];
	        this.schedule = source["schedule"];
	        this.suspend = source["suspend"];
	        this.active = source["active"];
	        this.lastSchedule = source["lastSchedule"];
	        this.age = source["age"];
	        this.concurrencyPolicy = source["concurrencyPolicy"];
	        this.successfulJobsHistoryLimit = source["successfulJobsHistoryLimit"];
	        this.failedJobsHistoryLimit = source["failedJobsHistoryLimit"];
	        this.startingDeadlineSeconds = source["startingDeadlineSeconds"];
	        this.images = source["images"];
	    }
	}
	export class CronJobInfo {
	    name: string;
	    namespace: string;
	    schedule: string;
	    suspend: boolean;
	    active: number;
	    lastSchedule: string;
	    age: string;
	    images: string[];
	
	    static createFrom(source: any = {}) {
	        return new CronJobInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.schedule = source["schedule"];
	        this.suspend = source["suspend"];
	        this.active = source["active"];
	        this.lastSchedule = source["lastSchedule"];
	        this.age = source["age"];
	        this.images = source["images"];
	    }
	}
	export class DaemonSetCondition {
	    type: string;
	    status: string;
	    lastTransitionTime: string;
	    reason: string;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new DaemonSetCondition(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.status = source["status"];
	        this.lastTransitionTime = source["lastTransitionTime"];
	        this.reason = source["reason"];
	        this.message = source["message"];
	    }
	}
	export class DaemonSetDetail {
	    name: string;
	    namespace: string;
	    uid: string;
	    creationTimestamp: string;
	    labels: Record<string, string>;
	    annotations: Record<string, string>;
	    desired: number;
	    current: number;
	    ready: number;
	    upToDate: number;
	    available: number;
	    age: string;
	    updateStrategy: string;
	    minReadySeconds: number;
	    revisionHistoryLimit?: number;
	    selector: Record<string, string>;
	    nodeSelector: Record<string, string>;
	    conditions: DaemonSetCondition[];
	    images: string[];
	
	    static createFrom(source: any = {}) {
	        return new DaemonSetDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.uid = source["uid"];
	        this.creationTimestamp = source["creationTimestamp"];
	        this.labels = source["labels"];
	        this.annotations = source["annotations"];
	        this.desired = source["desired"];
	        this.current = source["current"];
	        this.ready = source["ready"];
	        this.upToDate = source["upToDate"];
	        this.available = source["available"];
	        this.age = source["age"];
	        this.updateStrategy = source["updateStrategy"];
	        this.minReadySeconds = source["minReadySeconds"];
	        this.revisionHistoryLimit = source["revisionHistoryLimit"];
	        this.selector = source["selector"];
	        this.nodeSelector = source["nodeSelector"];
	        this.conditions = this.convertValues(source["conditions"], DaemonSetCondition);
	        this.images = source["images"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class DaemonSetInfo {
	    name: string;
	    namespace: string;
	    desired: number;
	    current: number;
	    ready: number;
	    upToDate: number;
	    available: number;
	    age: string;
	    nodeSelector: string;
	    images: string[];
	
	    static createFrom(source: any = {}) {
	        return new DaemonSetInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.desired = source["desired"];
	        this.current = source["current"];
	        this.ready = source["ready"];
	        this.upToDate = source["upToDate"];
	        this.available = source["available"];
	        this.age = source["age"];
	        this.nodeSelector = source["nodeSelector"];
	        this.images = source["images"];
	    }
	}
	export class DeploymentCondition {
	    type: string;
	    status: string;
	    lastTransitionTime: string;
	    reason: string;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new DeploymentCondition(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.status = source["status"];
	        this.lastTransitionTime = source["lastTransitionTime"];
	        this.reason = source["reason"];
	        this.message = source["message"];
	    }
	}
	export class DeploymentDetail {
	    name: string;
	    namespace: string;
	    uid: string;
	    creationTimestamp: string;
	    labels: Record<string, string>;
	    annotations: Record<string, string>;
	    ready: string;
	    upToDate: number;
	    available: number;
	    age: string;
	    strategy: string;
	    minReadySeconds: number;
	    revisionHistoryLimit?: number;
	    selector: Record<string, string>;
	    maxSurge: string;
	    maxUnavailable: string;
	    conditions: DeploymentCondition[];
	    images: string[];
	
	    static createFrom(source: any = {}) {
	        return new DeploymentDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.uid = source["uid"];
	        this.creationTimestamp = source["creationTimestamp"];
	        this.labels = source["labels"];
	        this.annotations = source["annotations"];
	        this.ready = source["ready"];
	        this.upToDate = source["upToDate"];
	        this.available = source["available"];
	        this.age = source["age"];
	        this.strategy = source["strategy"];
	        this.minReadySeconds = source["minReadySeconds"];
	        this.revisionHistoryLimit = source["revisionHistoryLimit"];
	        this.selector = source["selector"];
	        this.maxSurge = source["maxSurge"];
	        this.maxUnavailable = source["maxUnavailable"];
	        this.conditions = this.convertValues(source["conditions"], DeploymentCondition);
	        this.images = source["images"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class DeploymentInfo {
	    name: string;
	    namespace: string;
	    ready: string;
	    upToDate: number;
	    available: number;
	    age: string;
	    strategy: string;
	    images: string[];
	
	    static createFrom(source: any = {}) {
	        return new DeploymentInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.ready = source["ready"];
	        this.upToDate = source["upToDate"];
	        this.available = source["available"];
	        this.age = source["age"];
	        this.strategy = source["strategy"];
	        this.images = source["images"];
	    }
	}
	export class EventInfo {
	    type: string;
	    reason: string;
	    message: string;
	    source: string;
	    count: number;
	    firstTimestamp: string;
	    lastTimestamp: string;
	    age: string;
	
	    static createFrom(source: any = {}) {
	        return new EventInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.reason = source["reason"];
	        this.message = source["message"];
	        this.source = source["source"];
	        this.count = source["count"];
	        this.firstTimestamp = source["firstTimestamp"];
	        this.lastTimestamp = source["lastTimestamp"];
	        this.age = source["age"];
	    }
	}
	export class IngressPath {
	    path: string;
	    pathType: string;
	    backend: string;
	
	    static createFrom(source: any = {}) {
	        return new IngressPath(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.path = source["path"];
	        this.pathType = source["pathType"];
	        this.backend = source["backend"];
	    }
	}
	export class IngressRule {
	    host: string;
	    paths: IngressPath[];
	
	    static createFrom(source: any = {}) {
	        return new IngressRule(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.host = source["host"];
	        this.paths = this.convertValues(source["paths"], IngressPath);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class IngressTLS {
	    hosts: string[];
	    secretName: string;
	
	    static createFrom(source: any = {}) {
	        return new IngressTLS(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.hosts = source["hosts"];
	        this.secretName = source["secretName"];
	    }
	}
	export class IngressDetail {
	    name: string;
	    namespace: string;
	    uid: string;
	    creationTimestamp: string;
	    labels: Record<string, string>;
	    annotations: Record<string, string>;
	    ingressClassName: string;
	    defaultBackend: string;
	    tls: IngressTLS[];
	    rules: IngressRule[];
	    age: string;
	
	    static createFrom(source: any = {}) {
	        return new IngressDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.uid = source["uid"];
	        this.creationTimestamp = source["creationTimestamp"];
	        this.labels = source["labels"];
	        this.annotations = source["annotations"];
	        this.ingressClassName = source["ingressClassName"];
	        this.defaultBackend = source["defaultBackend"];
	        this.tls = this.convertValues(source["tls"], IngressTLS);
	        this.rules = this.convertValues(source["rules"], IngressRule);
	        this.age = source["age"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class IngressInfo {
	    name: string;
	    namespace: string;
	    class: string;
	    hosts: string;
	    address: string;
	    ports: string;
	    age: string;
	
	    static createFrom(source: any = {}) {
	        return new IngressInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.class = source["class"];
	        this.hosts = source["hosts"];
	        this.address = source["address"];
	        this.ports = source["ports"];
	        this.age = source["age"];
	    }
	}
	
	
	
	export class JobCondition {
	    type: string;
	    status: string;
	    lastTransitionTime: string;
	    reason: string;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new JobCondition(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.status = source["status"];
	        this.lastTransitionTime = source["lastTransitionTime"];
	        this.reason = source["reason"];
	        this.message = source["message"];
	    }
	}
	export class JobDetail {
	    name: string;
	    namespace: string;
	    uid: string;
	    creationTimestamp: string;
	    labels: Record<string, string>;
	    annotations: Record<string, string>;
	    completions: string;
	    duration: string;
	    age: string;
	    status: string;
	    parallelism?: number;
	    backoffLimit?: number;
	    activeDeadlineSeconds?: number;
	    ttlSecondsAfterFinished?: number;
	    completionMode: string;
	    suspend: boolean;
	    active: number;
	    succeeded: number;
	    failed: number;
	    owner: string;
	    conditions: JobCondition[];
	    images: string[];
	
	    static createFrom(source: any = {}) {
	        return new JobDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.uid = source["uid"];
	        this.creationTimestamp = source["creationTimestamp"];
	        this.labels = source["labels"];
	        this.annotations = source["annotations"];
	        this.completions = source["completions"];
	        this.duration = source["duration"];
	        this.age = source["age"];
	        this.status = source["status"];
	        this.parallelism = source["parallelism"];
	        this.backoffLimit = source["backoffLimit"];
	        this.activeDeadlineSeconds = source["activeDeadlineSeconds"];
	        this.ttlSecondsAfterFinished = source["ttlSecondsAfterFinished"];
	        this.completionMode = source["completionMode"];
	        this.suspend = source["suspend"];
	        this.active = source["active"];
	        this.succeeded = source["succeeded"];
	        this.failed = source["failed"];
	        this.owner = source["owner"];
	        this.conditions = this.convertValues(source["conditions"], JobCondition);
	        this.images = source["images"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class JobInfo {
	    name: string;
	    namespace: string;
	    completions: string;
	    duration: string;
	    age: string;
	    status: string;
	    images: string[];
	
	    static createFrom(source: any = {}) {
	        return new JobInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.completions = source["completions"];
	        this.duration = source["duration"];
	        this.age = source["age"];
	        this.status = source["status"];
	        this.images = source["images"];
	    }
	}
	export class NamespaceCondition {
	    type: string;
	    status: string;
	    lastTransitionTime: string;
	    reason: string;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new NamespaceCondition(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.status = source["status"];
	        this.lastTransitionTime = source["lastTransitionTime"];
	        this.reason = source["reason"];
	        this.message = source["message"];
	    }
	}
	export class NamespaceDetail {
	    name: string;
	    status: string;
	    age: string;
	    uid: string;
	    creationTimestamp: string;
	    labels: Record<string, string>;
	    annotations: Record<string, string>;
	    conditions: NamespaceCondition[];
	
	    static createFrom(source: any = {}) {
	        return new NamespaceDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.status = source["status"];
	        this.age = source["age"];
	        this.uid = source["uid"];
	        this.creationTimestamp = source["creationTimestamp"];
	        this.labels = source["labels"];
	        this.annotations = source["annotations"];
	        this.conditions = this.convertValues(source["conditions"], NamespaceCondition);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class NamespaceInfo {
	    name: string;
	    status: string;
	    age: string;
	    labels: Record<string, string>;
	
	    static createFrom(source: any = {}) {
	        return new NamespaceInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.status = source["status"];
	        this.age = source["age"];
	        this.labels = source["labels"];
	    }
	}
	export class NamespaceResourceSummary {
	    pods: number;
	    deployments: number;
	    statefulSets: number;
	    daemonSets: number;
	    jobs: number;
	    cronJobs: number;
	    services: number;
	    configMaps: number;
	    secrets: number;
	
	    static createFrom(source: any = {}) {
	        return new NamespaceResourceSummary(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.pods = source["pods"];
	        this.deployments = source["deployments"];
	        this.statefulSets = source["statefulSets"];
	        this.daemonSets = source["daemonSets"];
	        this.jobs = source["jobs"];
	        this.cronJobs = source["cronJobs"];
	        this.services = source["services"];
	        this.configMaps = source["configMaps"];
	        this.secrets = source["secrets"];
	    }
	}
	export class NetworkPolicyEgressRule {
	    ports: NetworkPolicyPort[];
	    to: NetworkPolicyPeer[];
	
	    static createFrom(source: any = {}) {
	        return new NetworkPolicyEgressRule(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ports = this.convertValues(source["ports"], NetworkPolicyPort);
	        this.to = this.convertValues(source["to"], NetworkPolicyPeer);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class NetworkPolicyPeer {
	    podSelector: Record<string, string>;
	    namespaceSelector: Record<string, string>;
	    ipBlock: string;
	
	    static createFrom(source: any = {}) {
	        return new NetworkPolicyPeer(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.podSelector = source["podSelector"];
	        this.namespaceSelector = source["namespaceSelector"];
	        this.ipBlock = source["ipBlock"];
	    }
	}
	export class NetworkPolicyPort {
	    protocol: string;
	    port: string;
	
	    static createFrom(source: any = {}) {
	        return new NetworkPolicyPort(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.protocol = source["protocol"];
	        this.port = source["port"];
	    }
	}
	export class NetworkPolicyIngressRule {
	    ports: NetworkPolicyPort[];
	    from: NetworkPolicyPeer[];
	
	    static createFrom(source: any = {}) {
	        return new NetworkPolicyIngressRule(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ports = this.convertValues(source["ports"], NetworkPolicyPort);
	        this.from = this.convertValues(source["from"], NetworkPolicyPeer);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class NetworkPolicyDetail {
	    name: string;
	    namespace: string;
	    uid: string;
	    creationTimestamp: string;
	    labels: Record<string, string>;
	    annotations: Record<string, string>;
	    podSelector: Record<string, string>;
	    policyTypes: string[];
	    ingressRules: NetworkPolicyIngressRule[];
	    egressRules: NetworkPolicyEgressRule[];
	    age: string;
	
	    static createFrom(source: any = {}) {
	        return new NetworkPolicyDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.uid = source["uid"];
	        this.creationTimestamp = source["creationTimestamp"];
	        this.labels = source["labels"];
	        this.annotations = source["annotations"];
	        this.podSelector = source["podSelector"];
	        this.policyTypes = source["policyTypes"];
	        this.ingressRules = this.convertValues(source["ingressRules"], NetworkPolicyIngressRule);
	        this.egressRules = this.convertValues(source["egressRules"], NetworkPolicyEgressRule);
	        this.age = source["age"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class NetworkPolicyInfo {
	    name: string;
	    namespace: string;
	    podSelector: string;
	    policyTypes: string[];
	    age: string;
	
	    static createFrom(source: any = {}) {
	        return new NetworkPolicyInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.podSelector = source["podSelector"];
	        this.policyTypes = source["policyTypes"];
	        this.age = source["age"];
	    }
	}
	
	
	
	export class NodeAddress {
	    type: string;
	    address: string;
	
	    static createFrom(source: any = {}) {
	        return new NodeAddress(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.address = source["address"];
	    }
	}
	export class NodeCondition {
	    type: string;
	    status: string;
	    lastTransitionTime: string;
	    reason: string;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new NodeCondition(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.status = source["status"];
	        this.lastTransitionTime = source["lastTransitionTime"];
	        this.reason = source["reason"];
	        this.message = source["message"];
	    }
	}
	export class NodeImage {
	    names: string[];
	    sizeBytes: number;
	
	    static createFrom(source: any = {}) {
	        return new NodeImage(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.names = source["names"];
	        this.sizeBytes = source["sizeBytes"];
	    }
	}
	export class NodeTaint {
	    key: string;
	    value: string;
	    effect: string;
	
	    static createFrom(source: any = {}) {
	        return new NodeTaint(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.key = source["key"];
	        this.value = source["value"];
	        this.effect = source["effect"];
	    }
	}
	export class NodeSystemInfo {
	    machineID: string;
	    kernelVersion: string;
	    osImage: string;
	    containerRuntimeVersion: string;
	    kubeletVersion: string;
	    operatingSystem: string;
	    architecture: string;
	
	    static createFrom(source: any = {}) {
	        return new NodeSystemInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.machineID = source["machineID"];
	        this.kernelVersion = source["kernelVersion"];
	        this.osImage = source["osImage"];
	        this.containerRuntimeVersion = source["containerRuntimeVersion"];
	        this.kubeletVersion = source["kubeletVersion"];
	        this.operatingSystem = source["operatingSystem"];
	        this.architecture = source["architecture"];
	    }
	}
	export class NodeResources {
	    cpu: string;
	    memory: string;
	    pods: string;
	    ephemeralStorage: string;
	
	    static createFrom(source: any = {}) {
	        return new NodeResources(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.cpu = source["cpu"];
	        this.memory = source["memory"];
	        this.pods = source["pods"];
	        this.ephemeralStorage = source["ephemeralStorage"];
	    }
	}
	export class NodeDetail {
	    name: string;
	    uid: string;
	    creationTimestamp: string;
	    labels: Record<string, string>;
	    annotations: Record<string, string>;
	    status: string;
	    roles: string;
	    age: string;
	    addresses: NodeAddress[];
	    conditions: NodeCondition[];
	    capacity: NodeResources;
	    allocatable: NodeResources;
	    systemInfo: NodeSystemInfo;
	    taints: NodeTaint[];
	    podCIDR: string;
	    images: NodeImage[];
	
	    static createFrom(source: any = {}) {
	        return new NodeDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.uid = source["uid"];
	        this.creationTimestamp = source["creationTimestamp"];
	        this.labels = source["labels"];
	        this.annotations = source["annotations"];
	        this.status = source["status"];
	        this.roles = source["roles"];
	        this.age = source["age"];
	        this.addresses = this.convertValues(source["addresses"], NodeAddress);
	        this.conditions = this.convertValues(source["conditions"], NodeCondition);
	        this.capacity = this.convertValues(source["capacity"], NodeResources);
	        this.allocatable = this.convertValues(source["allocatable"], NodeResources);
	        this.systemInfo = this.convertValues(source["systemInfo"], NodeSystemInfo);
	        this.taints = this.convertValues(source["taints"], NodeTaint);
	        this.podCIDR = source["podCIDR"];
	        this.images = this.convertValues(source["images"], NodeImage);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class NodeInfo {
	    name: string;
	    status: string;
	    roles: string;
	    age: string;
	    kubeletVersion: string;
	    internalIP: string;
	    externalIP: string;
	    osImage: string;
	    containerRuntime: string;
	    labels: Record<string, string>;
	
	    static createFrom(source: any = {}) {
	        return new NodeInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.status = source["status"];
	        this.roles = source["roles"];
	        this.age = source["age"];
	        this.kubeletVersion = source["kubeletVersion"];
	        this.internalIP = source["internalIP"];
	        this.externalIP = source["externalIP"];
	        this.osImage = source["osImage"];
	        this.containerRuntime = source["containerRuntime"];
	        this.labels = source["labels"];
	    }
	}
	
	
	
	export class OwnerReference {
	    kind: string;
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new OwnerReference(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.kind = source["kind"];
	        this.name = source["name"];
	    }
	}
	export class PVCCondition {
	    type: string;
	    status: string;
	    lastTransitionTime: string;
	    reason: string;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new PVCCondition(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.status = source["status"];
	        this.lastTransitionTime = source["lastTransitionTime"];
	        this.reason = source["reason"];
	        this.message = source["message"];
	    }
	}
	export class PVCDetail {
	    name: string;
	    namespace: string;
	    uid: string;
	    creationTimestamp: string;
	    labels: Record<string, string>;
	    annotations: Record<string, string>;
	    status: string;
	    volume: string;
	    capacity: string;
	    accessModes: string;
	    storageClass: string;
	    volumeMode: string;
	    dataSource: string;
	    conditions: PVCCondition[];
	    age: string;
	
	    static createFrom(source: any = {}) {
	        return new PVCDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.uid = source["uid"];
	        this.creationTimestamp = source["creationTimestamp"];
	        this.labels = source["labels"];
	        this.annotations = source["annotations"];
	        this.status = source["status"];
	        this.volume = source["volume"];
	        this.capacity = source["capacity"];
	        this.accessModes = source["accessModes"];
	        this.storageClass = source["storageClass"];
	        this.volumeMode = source["volumeMode"];
	        this.dataSource = source["dataSource"];
	        this.conditions = this.convertValues(source["conditions"], PVCCondition);
	        this.age = source["age"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PVCInfo {
	    name: string;
	    namespace: string;
	    status: string;
	    volume: string;
	    capacity: string;
	    accessModes: string;
	    storageClass: string;
	    volumeMode: string;
	    age: string;
	
	    static createFrom(source: any = {}) {
	        return new PVCInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.status = source["status"];
	        this.volume = source["volume"];
	        this.capacity = source["capacity"];
	        this.accessModes = source["accessModes"];
	        this.storageClass = source["storageClass"];
	        this.volumeMode = source["volumeMode"];
	        this.age = source["age"];
	    }
	}
	export class PersistentVolumeDetail {
	    name: string;
	    uid: string;
	    creationTimestamp: string;
	    labels: Record<string, string>;
	    annotations: Record<string, string>;
	    capacity: string;
	    accessModes: string;
	    reclaimPolicy: string;
	    status: string;
	    claim: string;
	    storageClass: string;
	    volumeMode: string;
	    source: string;
	    mountOptions: string[];
	    age: string;
	
	    static createFrom(source: any = {}) {
	        return new PersistentVolumeDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.uid = source["uid"];
	        this.creationTimestamp = source["creationTimestamp"];
	        this.labels = source["labels"];
	        this.annotations = source["annotations"];
	        this.capacity = source["capacity"];
	        this.accessModes = source["accessModes"];
	        this.reclaimPolicy = source["reclaimPolicy"];
	        this.status = source["status"];
	        this.claim = source["claim"];
	        this.storageClass = source["storageClass"];
	        this.volumeMode = source["volumeMode"];
	        this.source = source["source"];
	        this.mountOptions = source["mountOptions"];
	        this.age = source["age"];
	    }
	}
	export class PersistentVolumeInfo {
	    name: string;
	    capacity: string;
	    accessModes: string;
	    reclaimPolicy: string;
	    status: string;
	    claim: string;
	    storageClass: string;
	    volumeMode: string;
	    age: string;
	
	    static createFrom(source: any = {}) {
	        return new PersistentVolumeInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.capacity = source["capacity"];
	        this.accessModes = source["accessModes"];
	        this.reclaimPolicy = source["reclaimPolicy"];
	        this.status = source["status"];
	        this.claim = source["claim"];
	        this.storageClass = source["storageClass"];
	        this.volumeMode = source["volumeMode"];
	        this.age = source["age"];
	    }
	}
	export class PodCondition {
	    type: string;
	    status: string;
	    lastTransitionTime: string;
	    reason: string;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new PodCondition(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.status = source["status"];
	        this.lastTransitionTime = source["lastTransitionTime"];
	        this.reason = source["reason"];
	        this.message = source["message"];
	    }
	}
	export class Volume {
	    name: string;
	    type: string;
	    source: string;
	
	    static createFrom(source: any = {}) {
	        return new Volume(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.type = source["type"];
	        this.source = source["source"];
	    }
	}
	export class PodDetail {
	    name: string;
	    namespace: string;
	    uid: string;
	    creationTimestamp: string;
	    labels: Record<string, string>;
	    annotations: Record<string, string>;
	    status: string;
	    ready: string;
	    restarts: number;
	    age: string;
	    nodeName: string;
	    ip: string;
	    hostIP: string;
	    startTime: string;
	    qosClass: string;
	    serviceAccountName: string;
	    restartPolicy: string;
	    conditions: PodCondition[];
	    initContainers: ContainerDetail[];
	    containers: ContainerDetail[];
	    volumes: Volume[];
	
	    static createFrom(source: any = {}) {
	        return new PodDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.uid = source["uid"];
	        this.creationTimestamp = source["creationTimestamp"];
	        this.labels = source["labels"];
	        this.annotations = source["annotations"];
	        this.status = source["status"];
	        this.ready = source["ready"];
	        this.restarts = source["restarts"];
	        this.age = source["age"];
	        this.nodeName = source["nodeName"];
	        this.ip = source["ip"];
	        this.hostIP = source["hostIP"];
	        this.startTime = source["startTime"];
	        this.qosClass = source["qosClass"];
	        this.serviceAccountName = source["serviceAccountName"];
	        this.restartPolicy = source["restartPolicy"];
	        this.conditions = this.convertValues(source["conditions"], PodCondition);
	        this.initContainers = this.convertValues(source["initContainers"], ContainerDetail);
	        this.containers = this.convertValues(source["containers"], ContainerDetail);
	        this.volumes = this.convertValues(source["volumes"], Volume);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PodInfo {
	    name: string;
	    namespace: string;
	    status: string;
	    ready: string;
	    restarts: number;
	    age: string;
	    labels: Record<string, string>;
	    nodeName: string;
	    ip: string;
	    containers: ContainerInfo[];
	
	    static createFrom(source: any = {}) {
	        return new PodInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.status = source["status"];
	        this.ready = source["ready"];
	        this.restarts = source["restarts"];
	        this.age = source["age"];
	        this.labels = source["labels"];
	        this.nodeName = source["nodeName"];
	        this.ip = source["ip"];
	        this.containers = this.convertValues(source["containers"], ContainerInfo);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PolicyRule {
	    apiGroups: string[];
	    resources: string[];
	    verbs: string[];
	    resourceNames: string[];
	    nonResourceURLs: string[];
	
	    static createFrom(source: any = {}) {
	        return new PolicyRule(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.apiGroups = source["apiGroups"];
	        this.resources = source["resources"];
	        this.verbs = source["verbs"];
	        this.resourceNames = source["resourceNames"];
	        this.nonResourceURLs = source["nonResourceURLs"];
	    }
	}
	export class ReplicaSetCondition {
	    type: string;
	    status: string;
	    lastTransitionTime: string;
	    reason: string;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new ReplicaSetCondition(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.status = source["status"];
	        this.lastTransitionTime = source["lastTransitionTime"];
	        this.reason = source["reason"];
	        this.message = source["message"];
	    }
	}
	export class ReplicaSetDetail {
	    name: string;
	    namespace: string;
	    uid: string;
	    creationTimestamp: string;
	    labels: Record<string, string>;
	    annotations: Record<string, string>;
	    desired: number;
	    current: number;
	    ready: number;
	    age: string;
	    selector: Record<string, string>;
	    ownerReferences: OwnerReference[];
	    conditions: ReplicaSetCondition[];
	    images: string[];
	
	    static createFrom(source: any = {}) {
	        return new ReplicaSetDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.uid = source["uid"];
	        this.creationTimestamp = source["creationTimestamp"];
	        this.labels = source["labels"];
	        this.annotations = source["annotations"];
	        this.desired = source["desired"];
	        this.current = source["current"];
	        this.ready = source["ready"];
	        this.age = source["age"];
	        this.selector = source["selector"];
	        this.ownerReferences = this.convertValues(source["ownerReferences"], OwnerReference);
	        this.conditions = this.convertValues(source["conditions"], ReplicaSetCondition);
	        this.images = source["images"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ReplicaSetInfo {
	    name: string;
	    namespace: string;
	    desired: number;
	    current: number;
	    ready: number;
	    age: string;
	    owner: string;
	    images: string[];
	
	    static createFrom(source: any = {}) {
	        return new ReplicaSetInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.desired = source["desired"];
	        this.current = source["current"];
	        this.ready = source["ready"];
	        this.age = source["age"];
	        this.owner = source["owner"];
	        this.images = source["images"];
	    }
	}
	export class SubjectInfo {
	    kind: string;
	    name: string;
	    namespace: string;
	    apiGroup: string;
	
	    static createFrom(source: any = {}) {
	        return new SubjectInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.kind = source["kind"];
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.apiGroup = source["apiGroup"];
	    }
	}
	export class RoleRefInfo {
	    apiGroup: string;
	    kind: string;
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new RoleRefInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.apiGroup = source["apiGroup"];
	        this.kind = source["kind"];
	        this.name = source["name"];
	    }
	}
	export class RoleBindingDetail {
	    name: string;
	    namespace: string;
	    kind: string;
	    uid: string;
	    creationTimestamp: string;
	    labels: Record<string, string>;
	    annotations: Record<string, string>;
	    roleRef: RoleRefInfo;
	    subjects: SubjectInfo[];
	    age: string;
	
	    static createFrom(source: any = {}) {
	        return new RoleBindingDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.kind = source["kind"];
	        this.uid = source["uid"];
	        this.creationTimestamp = source["creationTimestamp"];
	        this.labels = source["labels"];
	        this.annotations = source["annotations"];
	        this.roleRef = this.convertValues(source["roleRef"], RoleRefInfo);
	        this.subjects = this.convertValues(source["subjects"], SubjectInfo);
	        this.age = source["age"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class RoleBindingInfo {
	    name: string;
	    namespace: string;
	    kind: string;
	    roleRef: string;
	    subjects: number;
	    age: string;
	
	    static createFrom(source: any = {}) {
	        return new RoleBindingInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.kind = source["kind"];
	        this.roleRef = source["roleRef"];
	        this.subjects = source["subjects"];
	        this.age = source["age"];
	    }
	}
	export class RoleDetail {
	    name: string;
	    namespace: string;
	    kind: string;
	    uid: string;
	    creationTimestamp: string;
	    labels: Record<string, string>;
	    annotations: Record<string, string>;
	    rules: PolicyRule[];
	    age: string;
	
	    static createFrom(source: any = {}) {
	        return new RoleDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.kind = source["kind"];
	        this.uid = source["uid"];
	        this.creationTimestamp = source["creationTimestamp"];
	        this.labels = source["labels"];
	        this.annotations = source["annotations"];
	        this.rules = this.convertValues(source["rules"], PolicyRule);
	        this.age = source["age"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class RoleInfo {
	    name: string;
	    namespace: string;
	    kind: string;
	    rules: number;
	    age: string;
	
	    static createFrom(source: any = {}) {
	        return new RoleInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.kind = source["kind"];
	        this.rules = source["rules"];
	        this.age = source["age"];
	    }
	}
	
	export class SecretDetail {
	    name: string;
	    namespace: string;
	    uid: string;
	    creationTimestamp: string;
	    labels: Record<string, string>;
	    annotations: Record<string, string>;
	    type: string;
	    data: Record<string, string>;
	    age: string;
	
	    static createFrom(source: any = {}) {
	        return new SecretDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.uid = source["uid"];
	        this.creationTimestamp = source["creationTimestamp"];
	        this.labels = source["labels"];
	        this.annotations = source["annotations"];
	        this.type = source["type"];
	        this.data = source["data"];
	        this.age = source["age"];
	    }
	}
	export class SecretInfo {
	    name: string;
	    namespace: string;
	    type: string;
	    dataCount: number;
	    age: string;
	
	    static createFrom(source: any = {}) {
	        return new SecretInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.type = source["type"];
	        this.dataCount = source["dataCount"];
	        this.age = source["age"];
	    }
	}
	export class ServiceAccountDetail {
	    name: string;
	    namespace: string;
	    uid: string;
	    creationTimestamp: string;
	    labels: Record<string, string>;
	    annotations: Record<string, string>;
	    secrets: string[];
	    imagePullSecrets: string[];
	    automountServiceAccountToken?: boolean;
	    age: string;
	
	    static createFrom(source: any = {}) {
	        return new ServiceAccountDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.uid = source["uid"];
	        this.creationTimestamp = source["creationTimestamp"];
	        this.labels = source["labels"];
	        this.annotations = source["annotations"];
	        this.secrets = source["secrets"];
	        this.imagePullSecrets = source["imagePullSecrets"];
	        this.automountServiceAccountToken = source["automountServiceAccountToken"];
	        this.age = source["age"];
	    }
	}
	export class ServiceAccountInfo {
	    name: string;
	    namespace: string;
	    secrets: number;
	    age: string;
	
	    static createFrom(source: any = {}) {
	        return new ServiceAccountInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.secrets = source["secrets"];
	        this.age = source["age"];
	    }
	}
	export class ServicePort {
	    name: string;
	    port: number;
	    protocol: string;
	    targetPort: string;
	    nodePort: number;
	
	    static createFrom(source: any = {}) {
	        return new ServicePort(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.port = source["port"];
	        this.protocol = source["protocol"];
	        this.targetPort = source["targetPort"];
	        this.nodePort = source["nodePort"];
	    }
	}
	export class ServiceDetail {
	    name: string;
	    namespace: string;
	    uid: string;
	    creationTimestamp: string;
	    labels: Record<string, string>;
	    annotations: Record<string, string>;
	    type: string;
	    clusterIP: string;
	    externalIP: string;
	    sessionAffinity: string;
	    externalTrafficPolicy: string;
	    internalTrafficPolicy: string;
	    ipFamilies: string[];
	    ipFamilyPolicy: string;
	    ports: ServicePort[];
	    selector: Record<string, string>;
	    age: string;
	
	    static createFrom(source: any = {}) {
	        return new ServiceDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.uid = source["uid"];
	        this.creationTimestamp = source["creationTimestamp"];
	        this.labels = source["labels"];
	        this.annotations = source["annotations"];
	        this.type = source["type"];
	        this.clusterIP = source["clusterIP"];
	        this.externalIP = source["externalIP"];
	        this.sessionAffinity = source["sessionAffinity"];
	        this.externalTrafficPolicy = source["externalTrafficPolicy"];
	        this.internalTrafficPolicy = source["internalTrafficPolicy"];
	        this.ipFamilies = source["ipFamilies"];
	        this.ipFamilyPolicy = source["ipFamilyPolicy"];
	        this.ports = this.convertValues(source["ports"], ServicePort);
	        this.selector = source["selector"];
	        this.age = source["age"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ServiceInfo {
	    name: string;
	    namespace: string;
	    type: string;
	    clusterIP: string;
	    externalIP: string;
	    ports: string;
	    age: string;
	    selector: string;
	
	    static createFrom(source: any = {}) {
	        return new ServiceInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.type = source["type"];
	        this.clusterIP = source["clusterIP"];
	        this.externalIP = source["externalIP"];
	        this.ports = source["ports"];
	        this.age = source["age"];
	        this.selector = source["selector"];
	    }
	}
	
	export class StatefulSetCondition {
	    type: string;
	    status: string;
	    lastTransitionTime: string;
	    reason: string;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new StatefulSetCondition(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.status = source["status"];
	        this.lastTransitionTime = source["lastTransitionTime"];
	        this.reason = source["reason"];
	        this.message = source["message"];
	    }
	}
	export class VolumeClaimInfo {
	    name: string;
	    storageClass: string;
	    accessModes: string[];
	    storage: string;
	
	    static createFrom(source: any = {}) {
	        return new VolumeClaimInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.storageClass = source["storageClass"];
	        this.accessModes = source["accessModes"];
	        this.storage = source["storage"];
	    }
	}
	export class StatefulSetDetail {
	    name: string;
	    namespace: string;
	    uid: string;
	    creationTimestamp: string;
	    labels: Record<string, string>;
	    annotations: Record<string, string>;
	    ready: string;
	    currentReplicas: number;
	    updatedReplicas: number;
	    age: string;
	    updateStrategy: string;
	    partition?: number;
	    podManagementPolicy: string;
	    serviceName: string;
	    revisionHistoryLimit?: number;
	    minReadySeconds: number;
	    selector: Record<string, string>;
	    volumeClaimTemplates: VolumeClaimInfo[];
	    conditions: StatefulSetCondition[];
	    images: string[];
	
	    static createFrom(source: any = {}) {
	        return new StatefulSetDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.uid = source["uid"];
	        this.creationTimestamp = source["creationTimestamp"];
	        this.labels = source["labels"];
	        this.annotations = source["annotations"];
	        this.ready = source["ready"];
	        this.currentReplicas = source["currentReplicas"];
	        this.updatedReplicas = source["updatedReplicas"];
	        this.age = source["age"];
	        this.updateStrategy = source["updateStrategy"];
	        this.partition = source["partition"];
	        this.podManagementPolicy = source["podManagementPolicy"];
	        this.serviceName = source["serviceName"];
	        this.revisionHistoryLimit = source["revisionHistoryLimit"];
	        this.minReadySeconds = source["minReadySeconds"];
	        this.selector = source["selector"];
	        this.volumeClaimTemplates = this.convertValues(source["volumeClaimTemplates"], VolumeClaimInfo);
	        this.conditions = this.convertValues(source["conditions"], StatefulSetCondition);
	        this.images = source["images"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class StatefulSetInfo {
	    name: string;
	    namespace: string;
	    ready: string;
	    serviceName: string;
	    age: string;
	    images: string[];
	
	    static createFrom(source: any = {}) {
	        return new StatefulSetInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.namespace = source["namespace"];
	        this.ready = source["ready"];
	        this.serviceName = source["serviceName"];
	        this.age = source["age"];
	        this.images = source["images"];
	    }
	}
	export class StorageClassDetail {
	    name: string;
	    uid: string;
	    creationTimestamp: string;
	    labels: Record<string, string>;
	    annotations: Record<string, string>;
	    provisioner: string;
	    reclaimPolicy: string;
	    volumeBindingMode: string;
	    allowVolumeExpansion: boolean;
	    parameters: Record<string, string>;
	    mountOptions: string[];
	    allowedTopologies: string[];
	    age: string;
	    isDefault: boolean;
	
	    static createFrom(source: any = {}) {
	        return new StorageClassDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.uid = source["uid"];
	        this.creationTimestamp = source["creationTimestamp"];
	        this.labels = source["labels"];
	        this.annotations = source["annotations"];
	        this.provisioner = source["provisioner"];
	        this.reclaimPolicy = source["reclaimPolicy"];
	        this.volumeBindingMode = source["volumeBindingMode"];
	        this.allowVolumeExpansion = source["allowVolumeExpansion"];
	        this.parameters = source["parameters"];
	        this.mountOptions = source["mountOptions"];
	        this.allowedTopologies = source["allowedTopologies"];
	        this.age = source["age"];
	        this.isDefault = source["isDefault"];
	    }
	}
	export class StorageClassInfo {
	    name: string;
	    provisioner: string;
	    reclaimPolicy: string;
	    volumeBindingMode: string;
	    allowVolumeExpansion: boolean;
	    age: string;
	    isDefault: boolean;
	
	    static createFrom(source: any = {}) {
	        return new StorageClassInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.provisioner = source["provisioner"];
	        this.reclaimPolicy = source["reclaimPolicy"];
	        this.volumeBindingMode = source["volumeBindingMode"];
	        this.allowVolumeExpansion = source["allowVolumeExpansion"];
	        this.age = source["age"];
	        this.isDefault = source["isDefault"];
	    }
	}
	
	
	

}

