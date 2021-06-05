terraform {
  backend "remote" {
    organization = "dogehouse"

    workspaces {
      name = "media"
    }
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

variable "container" {}
variable "deployurl" {}

resource "kubernetes_deployment" "media" {
    metadata {
        name = "media"
        namespace = "dogehouse"
        labels = {
            app = "media"
        }
    }

    spec {
        replicas = 1
        
        selector {
            match_labels = {
                app = "media"
            }
        }

        template {
            metadata {
                name = "media"
                namespace = "dogehouse"
                labels = {
                    app = "media"
                }
            }

            spec {
                container {
                    image = var.container
                    name = "media"

                    port {
                        container_port = 80
                    }

                    liveness_probe {
                        http_get {
                            path = "/"
                            port = 80
                        }

                        initial_delay_seconds = 3
                        period_seconds        = 3
                    }
                }
                
                image_pull_secrets {
                    name = "regcred"
                }
            }
        }
    }
}

resource "kubernetes_service" "media" {
    metadata {
        name = "media"
        namespace = "dogehouse"
    }

    spec {
        selector = {
            app = kubernetes_deployment.media.metadata.0.labels.app
        }
        port {
            port = 80
            target_port = 80
        }
        type = "ClusterIP"
    }
}

resource "kubernetes_ingress" "media" {
    metadata {
        name = "media"
        namespace = "dogehouse"
        annotations = {
            "traefik.ingress.kubernetes.io/router.tls" = "true"
            "traefik.ingress.kubernetes.io/router.tls.certresolver" = "letsencrypt"
            "traefik.ingress.kubernetes.io/priority" = "4"
        }
    }

    spec {
        rule {
            host = var.deployurl
            http {
                path {
                    path = "/"
                    backend {
                        service_name = kubernetes_service.media.metadata.0.name
                        service_port = 80
                    }
                }
            }
        }
    }
}
